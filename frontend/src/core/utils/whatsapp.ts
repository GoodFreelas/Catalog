// Constants
import { WHATSAPP_CONFIG } from '../constants/api';

// Types
import { WhatsAppMessage, Product } from '../../types/index';

// ================================
// WhatsApp URL Generation
// ================================

/**
 * Gera URL do WhatsApp com mensagem
 * @param {string} message - Mensagem a ser enviada
 * @param {string} phoneNumber - Número do WhatsApp (opcional)
 * @returns {string} URL do WhatsApp
 */
export const generateWhatsAppURL = (message, phoneNumber = WHATSAPP_CONFIG.PHONE_NUMBER) => {
  const encodedMessage = encodeURIComponent(message);
  return `${WHATSAPP_CONFIG.BASE_URL}/${phoneNumber}?text=${encodedMessage}`;
};

/**
 * Abre WhatsApp com mensagem
 * @param {string} message - Mensagem a ser enviada
 * @param {string} phoneNumber - Número do WhatsApp (opcional)
 */
export const openWhatsApp = (message, phoneNumber = WHATSAPP_CONFIG.PHONE_NUMBER) => {
  const url = generateWhatsAppURL(message, phoneNumber);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Formata mensagem do carrinho para WhatsApp
 * @param {Array} items - Items do carrinho
 * @param {Object} customerInfo - Informações do cliente (opcional)
 * @returns {string} Mensagem formatada
 */
export const formatCartMessage = (items, customerInfo = {}) => {
  if (!items || items.length === 0) {
    return 'Carrinho vazio';
  }

  let message = `${WHATSAPP_CONFIG.MESSAGE_PREFIX}\n\n`;

  // Adicionar informações do cliente se fornecidas
  if (customerInfo.name) {
    message += `👤 *Cliente:* ${customerInfo.name}\n`;
  }
  if (customerInfo.phone) {
    message += `📱 *Telefone:* ${customerInfo.phone}\n`;
  }
  if (customerInfo.address) {
    message += `📍 *Endereço:* ${customerInfo.address}\n`;
  }

  if (Object.keys(customerInfo).length > 0) {
    message += '\n';
  }

  message += '🛒 *Produtos:*\n\n';

  let totalGeneral = 0;

  items.forEach((item, index) => {
    const price = parseFloat(item.preco) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const subtotal = price * quantity;
    totalGeneral += subtotal;

    message += `${index + 1}. *${item.nome}*\n`;

    if (item.codigo) {
      message += `   📦 Código: ${item.codigo}\n`;
    }

    message += `   📊 Quantidade: ${quantity}x\n`;
    message += `   💰 Preço unitário: R$ ${price.toFixed(2)}\n`;
    message += `   💵 Subtotal: R$ ${subtotal.toFixed(2)}\n\n`;
  });

  message += `*💸 TOTAL GERAL: R$ ${totalGeneral.toFixed(2)}*\n\n`;

  // Adicionar observações se fornecidas
  if (customerInfo.notes) {
    message += `📝 *Observações:* ${customerInfo.notes}\n\n`;
  }

  message += '✅ Confirma o pedido?\n';
  message += '🚚 Precisa de entrega?\n';
  message += '💳 Qual forma de pagamento?';

  return message;
};

/**
 * Valida número de WhatsApp
 * @param {string} phoneNumber - Número para validar
 * @returns {boolean} True se válido
 */
export const isValidWhatsAppNumber = (phoneNumber) => {
  if (!phoneNumber) return false;

  // Remove todos os caracteres não numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Verifica se tem pelo menos 10 dígitos (telefone local) e no máximo 15 (internacional)
  return cleanNumber.length >= 10 && cleanNumber.length <= 15;
};

/**
 * Formata número de telefone para WhatsApp
 * @param {string} phoneNumber - Número para formatar
 * @returns {string} Número formatado
 */
export const formatWhatsAppNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove todos os caracteres não numéricos
  let cleanNumber = phoneNumber.replace(/\D/g, '');

  // Se começar com 0, remove
  if (cleanNumber.startsWith('0')) {
    cleanNumber = cleanNumber.substring(1);
  }

  // Se for número brasileiro e não começar com 55, adiciona
  if (cleanNumber.length === 11 && !cleanNumber.startsWith('55')) {
    cleanNumber = '55' + cleanNumber;
  }

  return cleanNumber;
};

/**
 * Envia mensagem via WhatsApp Web
 * @param {string} message - Mensagem a ser enviada
 * @param {string} phoneNumber - Número do destinatário
 */
export const sendWhatsAppMessage = (message, phoneNumber = WHATSAPP_CONFIG.PHONE_NUMBER) => {
  try {
    const formattedNumber = formatWhatsAppNumber(phoneNumber);

    if (!isValidWhatsAppNumber(formattedNumber)) {
      throw new Error('Número de WhatsApp inválido');
    }

    openWhatsApp(message, formattedNumber);

  } catch (error) {
    throw error;
  }
};