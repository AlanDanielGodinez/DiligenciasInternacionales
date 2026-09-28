import { parseEventDate } from './calendarDate';

test('interpreta una fecha canónica sin desplazar el día por zona horaria', () => {
  const parsed = parseEventDate('2026-09-24');
  expect(parsed.getFullYear()).toBe(2026);
  expect(parsed.getMonth()).toBe(8);
  expect(parsed.getDate()).toBe(24);
});

test('conserva fecha y hora de eventos logísticos', () => {
  const parsed = parseEventDate('2026-09-24T15:30:00');
  expect(parsed.getDate()).toBe(24);
  expect(parsed.getHours()).toBe(15);
  expect(parsed.getMinutes()).toBe(30);
});
