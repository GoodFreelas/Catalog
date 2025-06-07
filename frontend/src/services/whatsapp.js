import { CONFIG } from '../utils/constants';
import { formatters } from '../utils/formatters';

export class WhatsAppService {
  constructor() {
    this.number = CONFIG.whatsapp.number;
    this.baseMessage = CONFIG.whatsapp.message;
  }

  // Gerar mensagem formatada do carrinho
  generateCartMessage(cart, customerInfo = {}) {
    let message = `${this.baseMessage}\n\n`;

    // Informações do cliente (se fornecidas)
    if (customerInfo.name) {
      message += `👤 *Cliente:* ${customerInfo.name}\n`;
    }
    if (customerInfo.phone) {
      message += `📱 *Telefone:* ${customerInfo.phone}\n`;
    }
    if (customerInfo.email) {
      message += `📧 *Email:* ${customerInfo.email}\n`;
    }

    if (Object.keys(customerInfo).length > 0) {
      message += '\n';
    }

    message += `🛒 *PEDIDO:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Lista de produtos
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.nome}*\n`;
      message += `   📦 Código: ${item.codigo}\n`;
      message += `   🔢 Quantidade: ${item.quantity}\n`;
      message += `   💰 Preço unitário: ${formatters.currency(item.preco)}\n`;
      message += `   💵 Subtotal: ${formatters.currency(item.preco * item.quantity)}\n\n`;
    });

    // Total
    const total = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🧮 *TOTAL: ${formatters.currency(total)}*\n\n`;

    // Informações adicionais
    message += `📝 *Observações:*\n`;
    message += `• Aguardando confirmação do pedido\n`;
    message += `• Forma de pagamento a combinar\n`;
    message += `• Prazo de entrega a confirmar\n\n`;

    message += `⏰ Pedido enviado em: ${formatters.date(new Date())}\n`;
    message += `🏪 ${CONFIG.loja.nome}`;

    return message;
  }

  // Gerar mensagem para produto único
  generateProductMessage(product, quantity = 1) {
    let message = `Olá! Tenho interesse neste produto:\n\n`;

    message += `📱 *${product.nome}*\n`;
    message += `📦 Código: ${product.codigo}\n`;
    message += `💰 Preço: ${formatters.currency(product.preco)}\n`;
    message += `🔢 Quantidade desejada: ${quantity}\n`;

    if (product.descricao) {
      message += `📝 Descrição: ${formatters.truncate(product.descricao, 100)}\n`;
    }

    const total = product.preco * quantity;
    message += `\n💵 *Total: ${formatters.currency(total)}*\n\n`;

    message += `Poderia me enviar mais informações?\n\n`;
    message += `🏪 ${CONFIG.loja.nome}`;

    return message;
  }

  // Gerar mensagem de dúvida sobre produto
  generateInquiryMessage(product) {
    let message = `Olá! Gostaria de tirar uma dúvida sobre este produto:\n\n`;

    message += `📱 *${product.nome}*\n`;
    message += `📦 Código: ${product.codigo}\n`;
    message += `💰 Preço: ${formatters.currency(product.preco)}\n\n`;

    message += `Poderia me ajudar com mais informações?\n\n`;
    message += `🏪 ${CONFIG.loja.nome}`;

    return message;
  }

  // Abrir WhatsApp com mensagem
  openWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${this.number}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }

  // Enviar carrinho
  sendCart(cart, customerInfo = {}) {
    if (!cart || cart.length === 0) {
      throw new Error('Carrinho vazio');
    }

    const message = this.generateCartMessage(cart, customerInfo);
    this.openWhatsApp(message);
  }

  // Enviar produto único
  sendProduct(product, quantity = 1) {
    if (!product) {
      throw new Error('Produto não informado');
    }

    const message = this.generateProductMessage(product, quantity);
    this.openWhatsApp(message);
  }

  // Enviar dúvida sobre produto
  sendInquiry(product) {
    if (!product) {
      throw new Error('Produto não informado');
    }

    const message = this.generateInquiryMessage(product);
    this.openWhatsApp(message);
  }

  // Validar número do WhatsApp
  static validateNumber(number) {
    // Remove todos os caracteres não numéricos
    const cleaned = number.replace(/\D/g, '');

    // Verifica se é um número brasileiro válido
    const brazilPattern = /^55\d{10,11}$/;

    return brazilPattern.test(cleaned);
  }

  // Formatar número para padrão internacional
  static formatNumber(number) {
    const cleaned = number.replace(/\D/g, '');

    // Se já tem código do país, retorna como está
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      return cleaned;
    }

    // Se é número brasileiro sem código do país
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }

    return cleaned;
  }
}

// Instância singleton
export const whatsappService = new WhatsAppService();