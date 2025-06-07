export const WhatsAppService = {
  whatsappNumber: "5551999999999", // Substitua pelo número correto (com código do país)

  sendOrder(cartItems, total) {
    if (cartItems.length === 0) return;

    let message = "Olá! Gostaria de fazer um pedido:\n\n";

    cartItems.forEach((item, index) => {
      const price = item.preco_promocional > 0 ? item.preco_promocional : item.preco;
      const itemTotal = price * item.quantity;
      message += `${index + 1}. ${item.nome}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço unitário: R$ ${price.toFixed(2)}\n`;
      message += `   Subtotal: R$ ${itemTotal.toFixed(2)}\n\n`;
    });

    message += `*Total do pedido: R$ ${total.toFixed(2)}*\n\n`;
    message += "Aguardo retorno para finalizar a compra!";

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
  },

  // Método alternativo para enviar mensagem personalizada
  sendCustomMessage(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  },

  // Método para obter o número formatado
  getFormattedNumber() {
    return this.whatsappNumber;
  }
};