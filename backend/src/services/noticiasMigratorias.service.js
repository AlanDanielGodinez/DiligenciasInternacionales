const Parser = require('rss-parser');
const cheerio = require('cheerio');

const OFFICIAL_HOSTS = [
  'travel.state.gov',
  'mx.usembassy.gov'
];

const VISAS_NEWS_URL = 'https://travel.state.gov/content/travel/en/News/visas-news.html';
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_ITEMS = 6;
const NEWS_KEYWORDS = [
  'visa',
  'embassy',
  'consulate',
  'consular',
  'passport',
  'travel',
  'migration',
  'immigrant',
  'nonimmigrant'
];
const parser = new Parser();

function isOfficialUrl(value) {
  if (!value) return false;

  try {
    const { hostname, protocol } = new URL(value);
    return protocol === 'https:' && OFFICIAL_HOSTS.some(
      (officialHost) => hostname === officialHost || hostname.endsWith(`.${officialHost}`)
    );
  } catch {
    return false;
  }
}

function toAbsoluteOfficialUrl(value, baseUrl) {
  if (!value) return null;

  try {
    const absoluteUrl = new URL(value, baseUrl).toString();
    return isOfficialUrl(absoluteUrl) ? absoluteUrl : null;
  } catch {
    return null;
  }
}

function isRelevant(item) {
  const searchableText = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  return NEWS_KEYWORDS.some((keyword) => searchableText.includes(keyword));
}

function normalizeDate(value) {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString();
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null;

  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const description = typeof item.description === 'string' ? item.description.trim() : '';
  const source = typeof item.source === 'string' ? item.source.trim() : '';
  const date = normalizeDate(item.date);
  const url = typeof item.url === 'string' ? item.url.trim() : '';
  const image = typeof item.image === 'string' && item.image.trim() ? item.image.trim() : null;

  if (!title || !description || !source || !date || !isOfficialUrl(url)) {
    return null;
  }

  const normalizedItem = {
    title,
    description,
    image: image && isOfficialUrl(image) ? image : null,
    date,
    source,
    url,
    isOfficial: true
  };

  return isRelevant(normalizedItem) ? normalizedItem : null;
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map(normalizeItem)
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_ITEMS);
}

function getTimeoutMs() {
  const configuredTimeout = Number(process.env.NEWS_MIGRATION_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS;
}

async function fetchText(url, signal, accept) {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      'User-Agent': 'DiligenciasInternacionales-News/1.0'
    },
    signal
  });

  if (!response.ok) {
    throw new Error(`Official source responded with status ${response.status}`);
  }

  return response.text();
}

function getRssUrls() {
  return (process.env.NEWS_MIGRATION_RSS_URLS || '')
    .split(',')
    .map((url) => url.trim())
    .filter(isOfficialUrl);
}

async function getRssItems(signal) {
  const rssUrls = getRssUrls();

  for (const rssUrl of rssUrls) {
    try {
      const xml = await fetchText(
        rssUrl,
        signal,
        'application/rss+xml, application/atom+xml, application/xml, text/xml'
      );
      const feed = await parser.parseString(xml);
      const source = feed.title || new URL(rssUrl).hostname;
      const items = normalizeItems((feed.items || []).map((item) => ({
        title: item.title,
        description: item.contentSnippet || item.summary || item.content,
        image: item.enclosure?.url || null,
        date: item.isoDate || item.pubDate,
        source,
        url: item.link
      })));

      if (items.length > 0) return items;
    } catch {
      // Continue with the next official RSS source.
    }
  }

  return [];
}

function extractArticleMetadata(html, articleUrl) {
  const $ = cheerio.load(html);
  const description = (
    $('meta[property="og:description"]').attr('content')
    || $('meta[name="description"]').attr('content')
    || $('.tsg-rwd-main-copy-body-frame p').filter((_, element) => {
      return $(element).text().trim().length > 60;
    }).first().text()
    || ''
  ).replace(/\s+/g, ' ').trim();
  const image = toAbsoluteOfficialUrl(
    $('meta[property="og:image"]').attr('content'),
    articleUrl
  );

  return { description, image };
}

async function getVisaNewsItems(signal) {
  const html = await fetchText(VISAS_NEWS_URL, signal, 'text/html');
  const $ = cheerio.load(html);
  const entries = [];

  $('.tsg-rwd-main-copy-body-frame .tsglist li').each((_, element) => {
    const anchor = $(element).find('a[href*="/News/visas-news/"]').first();
    const url = toAbsoluteOfficialUrl(anchor.attr('href'), VISAS_NEWS_URL);
    const title = anchor.text().replace(/\s+/g, ' ').trim();
    const date = $(element).find('span').first().text().replace(/\s+/g, ' ').trim();

    if (url && title && date && !url.endsWith('/archive.html')) {
      entries.push({ title, date, url });
    }
  });

  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.url, entry])).values()
  ).slice(0, MAX_ITEMS);
  const enrichedEntries = await Promise.all(uniqueEntries.map(async (entry) => {
    try {
      const articleHtml = await fetchText(entry.url, signal, 'text/html');
      const metadata = extractArticleMetadata(articleHtml, entry.url);
      return {
        ...entry,
        description: metadata.description || entry.title,
        image: metadata.image,
        source: 'Travel.State.Gov'
      };
    } catch {
      return {
        ...entry,
        description: entry.title,
        image: null,
        source: 'Travel.State.Gov'
      };
    }
  }));

  return normalizeItems(enrichedEntries);
}

function getConfiguredItems() {
  const rawItems = process.env.NEWS_MIGRATION_ITEMS_JSON;
  if (!rawItems) return [];

  try {
    return normalizeItems(JSON.parse(rawItems));
  } catch {
    return [];
  }
}

async function getNoticiasMigratorias() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const rssItems = await getRssItems(controller.signal);
    if (rssItems.length > 0) {
      return { items: rssItems, status: 'official-rss' };
    }

    try {
      const visaNewsItems = await getVisaNewsItems(controller.signal);
      if (visaNewsItems.length > 0) {
        return { items: visaNewsItems, status: 'official-visas-news' };
      }
    } catch {
      // Fall through to the manually configured official items.
    }

    const configuredItems = getConfiguredItems();
    if (configuredItems.length > 0) {
      return { items: configuredItems, status: 'configured-fallback' };
    }

    return { items: [], status: 'unavailable' };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  getNoticiasMigratorias
};
