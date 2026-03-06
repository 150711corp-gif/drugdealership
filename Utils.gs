/**
 * Общие утилиты: ошибки, ответы API, проверка входа, даты.
 */
function buildOk(data) {
  return { ok: true, data: data || {} };
}

function buildError(message, details) {
  return { ok: false, error: { message: message, details: details || null } };
}

function withApiGuard(fn) {
  try {
    return buildOk(fn());
  } catch (error) {
    return buildError(error.message || 'Неизвестная ошибка', { stack: error.stack });
  }
}

function assertRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error('Поле обязательно: ' + fieldName);
  }
}

function toIsoDate(date) {
  if (!date) {
    return '';
  }
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function nowIso() {
  return new Date().toISOString();
}

function generateId(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
}

function parseJsonOrDefault(value, fallback) {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function normalizeBool(value) {
  return String(value).toLowerCase() === 'true' || value === true;
}
