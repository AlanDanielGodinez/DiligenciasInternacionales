import { API_ENDPOINTS } from '../config/api';

const NEWS_TIMEOUT_MS = 5000;

const isValidNewsItem = (item) => (
  item
  && item.isOfficial === true
  && typeof item.title === 'string'
  && typeof item.description === 'string'
  && typeof item.date === 'string'
  && typeof item.source === 'string'
  && typeof item.url === 'string'
);

export const fetchNewsItems = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NEWS_TIMEOUT_MS);

  try {
    const response = await fetch(API_ENDPOINTS.MIGRATION_NEWS, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Noticias HTTP ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload) ? payload.filter(isValidNewsItem) : [];
  } finally {
    clearTimeout(timeoutId);
  }
};
