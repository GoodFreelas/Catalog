/**
 * Formata valor monetário para Real brasileiro
 * @param {number|string} value - Valor a ser formatado
 * @param {Object} options - Opções de formatação
 * @returns {string} Valor formatado
 */
export const formatCurrency = (value, options = {}) => {
  const {
    currency = 'BRL',
    locale = 'pt-BR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericValue);
};

/**
 * Formata número com separadores de milhares
 * @param {number|string} value - Número a ser formatado
 * @param {string} locale - Localização (padrão: pt-BR)
 * @returns {string} Número formatado
 */
export const formatNumber = (value, locale = 'pt-BR') => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '0';
  }

  return new Intl.NumberFormat(locale).format(numericValue);
};

/**
 * Formata data para formato brasileiro
 * @param {Date|string} date - Data a ser formatada
 * @param {Object} options - Opções de formatação
 * @returns {string} Data formatada
 */
export const formatDate = (date, options = {}) => {
  const {
    locale = 'pt-BR',
    dateStyle = 'short',
    timeStyle,
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }

  const formatOptions = { dateStyle };
  if (timeStyle) {
    formatOptions.timeStyle = timeStyle;
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
};

/**
 * Formata data/hora relativa (ex: "há 2 horas")
 * @param {Date|string} date - Data a ser formatada
 * @param {string} locale - Localização (padrão: pt-BR)
 * @returns {string} Data relativa formatada
 */
export const formatRelativeTime = (date, locale = 'pt-BR') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.round((dateObj.getTime() - now.getTime()) / 1000);

  // Determina a unidade apropriada
  const intervals = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
    }
  }

  return rtf.format(0, 'second');
};

/**
 * Trunca texto com reticências
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Formata texto para slug (URL-friendly)
 * @param {string} text - Texto a ser formatado
 * @returns {string} Slug formatado
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens do início/fim
};

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} text - Texto a ser formatado
 * @returns {string} Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formata bytes para tamanho legível
 * @param {number} bytes - Bytes a serem formatados
 * @param {number} decimals - Casas decimais (padrão: 2)
 * @returns {string} Tamanho formatado
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formata porcentagem
 * @param {number} value - Valor decimal (ex: 0.25 para 25%)
 * @param {Object} options - Opções de formatação
 * @returns {string} Porcentagem formatada
 */
export const formatPercentage = (value, options = {}) => {
  const {
    locale = 'pt-BR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '0%';
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericValue);
};

/**
 * Máscara para CPF
 * @param {string} value - CPF sem máscara
 * @returns {string} CPF com máscara
 */
export const formatCPF = (value) => {
  if (!value) return '';

  const cleanValue = value.replace(/\D/g, '');

  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

/**
 * Máscara para telefone
 * @param {string} value - Telefone sem máscara
 * @returns {string} Telefone com máscara
 */
export const formatPhone = (value) => {
  if (!value) return '';

  const cleanValue = value.replace(/\D/g, '');

  if (cleanValue.length <= 10) {
    // Telefone fixo: (11) 1234-5678
    return cleanValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    // Celular: (11) 91234-5678
    return cleanValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
};