const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_VALUES = new Set(['Present', 'Absent']);

const trimString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeStatus = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const normalized = trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
  return STATUS_VALUES.has(normalized) ? normalized : '';
};

const isValidEmail = (value) => EMAIL_REGEX.test(value);

const isValidDate = (value) => {
  if (!DATE_REGEX.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

module.exports = {
  trimString,
  normalizeStatus,
  isValidEmail,
  isValidDate
};
