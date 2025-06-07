// Formatadores de dados
export const formatters = {
  // Formatar preço em BRL
  currency: (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  // Formatar número
  number: (value) => {
    if (typeof value !== 'number') return '0';

    return new Intl.NumberFormat('pt-BR').format(value);
  },

  // Formatar data
  date: (value) => {
    if (!value) return '';

    const date = new Date(value);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  },

  // Formatar texto para URL amigável
  slug: (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  // Truncar texto
  truncate: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },

  // Formatar telefone
  phone: (phone) => {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return phone;
  },

  // Capitalizar primeira letra
  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Formatar status do produto
  productStatus: (status) => {
    return status === 'A' ? 'Ativo' : 'Inativo';
  }
};