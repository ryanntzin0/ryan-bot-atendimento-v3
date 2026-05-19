/**
 * Estrutura futura para WhatsApp Cloud API.
 * Ainda NÃO está sendo usada na V4.
 */

async function sendWhatsAppMessage({ telefone, texto }) {
  // Futuro: chamar endpoint da Meta/WhatsApp Cloud API para enviar mensagem real.
  return { enviado: false, motivo: "WhatsApp real ainda não conectado." };
}

function formatIncomingWhatsAppMessage(payload) {
  // Futuro: transformar payload real da Meta em { empresaId, telefone, nome, mensagem }.
  return payload;
}

function validateWhatsAppWebhook(req) {
  // Futuro: validar token e assinatura do webhook da Meta.
  return true;
}

module.exports = { sendWhatsAppMessage, formatIncomingWhatsAppMessage, validateWhatsAppWebhook };
