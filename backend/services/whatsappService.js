const { supabase } = require("./supabaseClient");

function maskSecret(value) {
  if (!value) return "";
  if (value.length <= 10) return "********";
  return `${value.slice(0, 6)}********${value.slice(-4)}`;
}

function isMasked(value) {
  return typeof value === "string" && value.includes("********");
}

function sanitizeConfig(row, mask = true) {
  if (!row) {
    return {
      ativo: false,
      phone_number_id: "",
      whatsapp_business_account_id: "",
      access_token: "",
      verify_token: "ryan-bot-webhook-2026",
      app_secret: "",
      numero_exibicao: ""
    };
  }

  return {
    id: row.id,
    empresaId: row.empresa_id,
    ativo: row.ativo,
    phone_number_id: row.phone_number_id || "",
    whatsapp_business_account_id: row.whatsapp_business_account_id || "",
    access_token: mask ? maskSecret(row.access_token) : (row.access_token || ""),
    verify_token: row.verify_token || "",
    app_secret: mask ? maskSecret(row.app_secret) : (row.app_secret || ""),
    numero_exibicao: row.numero_exibicao || "",
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

async function getWhatsAppConfigByEmpresa(empresaId, { mask = true } = {}) {
  const { data, error } = await supabase
    .from("whatsapp_integracoes")
    .select("*")
    .eq("empresa_id", empresaId)
    .maybeSingle();

  if (error) throw error;
  return sanitizeConfig(data, mask);
}

async function getRawWhatsAppConfigByEmpresa(empresaId) {
  const { data, error } = await supabase
    .from("whatsapp_integracoes")
    .select("*")
    .eq("empresa_id", empresaId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getWhatsAppConfigByPhoneNumberId(phoneNumberId) {
  if (!phoneNumberId) return null;

  const { data, error } = await supabase
    .from("whatsapp_integracoes")
    .select("*")
    .eq("phone_number_id", phoneNumberId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function saveWhatsAppConfig(empresaId, payload) {
  const atual = await getRawWhatsAppConfigByEmpresa(empresaId);

  const base = {
    empresa_id: empresaId,
    ativo: payload.ativo ?? false,
    phone_number_id: payload.phone_number_id || "",
    whatsapp_business_account_id: payload.whatsapp_business_account_id || "",
    verify_token: payload.verify_token || "ryan-bot-webhook-2026",
    numero_exibicao: payload.numero_exibicao || "",
    atualizado_em: new Date().toISOString()
  };

  if (payload.access_token && !isMasked(payload.access_token)) {
    base.access_token = payload.access_token;
  } else if (atual?.access_token) {
    base.access_token = atual.access_token;
  }

  if (payload.app_secret && !isMasked(payload.app_secret)) {
    base.app_secret = payload.app_secret;
  } else if (atual?.app_secret) {
    base.app_secret = atual.app_secret;
  }

  const { data, error } = await supabase
    .from("whatsapp_integracoes")
    .upsert(base, { onConflict: "empresa_id" })
    .select("*")
    .single();

  if (error) throw error;
  return sanitizeConfig(data, true);
}

async function isWhatsAppEnabled(empresaId) {
  const config = await getRawWhatsAppConfigByEmpresa(empresaId);
  return Boolean(config?.ativo && config?.phone_number_id && config?.access_token);
}

function normalizePhone(telefone) {
  return String(telefone || "").replace(/\D/g, "");
}

async function sendWhatsAppTextMessage(empresaId, telefone, texto) {
  const config = await getRawWhatsAppConfigByEmpresa(empresaId);

  if (!config) return { enviado: false, motivo: "Integração WhatsApp não configurada." };
  if (!config.ativo) return { enviado: false, motivo: "Integração WhatsApp está desativada." };
  if (!config.phone_number_id) return { enviado: false, motivo: "phone_number_id não configurado." };
  if (!config.access_token) return { enviado: false, motivo: "access_token não configurado." };

  const graphVersion = process.env.META_GRAPH_API_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${graphVersion}/${config.phone_number_id}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: normalizePhone(telefone),
    type: "text",
    text: {
      preview_url: false,
      body: String(texto || "")
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        enviado: false,
        motivo: data?.error?.message || "Erro ao enviar mensagem pelo WhatsApp.",
        status: response.status,
        detalhes: data
      };
    }

    return { enviado: true, motivo: "Mensagem enviada pelo WhatsApp.", data };
  } catch (error) {
    return { enviado: false, motivo: error.message || "Falha ao chamar API do WhatsApp." };
  }
}

function extractMessageFromWebhook(payload) {
  const entry = payload?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  const phoneNumberId = value?.metadata?.phone_number_id;
  const contact = value?.contacts?.[0];
  const message = value?.messages?.[0];

  if (!message) {
    return { ignorar: true, motivo: "Payload sem mensagem. Pode ser evento de status.", phoneNumberId };
  }

  if (message.type !== "text") {
    return { ignorar: true, motivo: `Tipo de mensagem ainda não suportado: ${message.type}`, phoneNumberId };
  }

  return {
    ignorar: false,
    phoneNumberId,
    telefone: message.from,
    nome: contact?.profile?.name || "Cliente WhatsApp",
    mensagem: message?.text?.body || "",
    messageId: message.id,
    timestamp: message.timestamp
  };
}

function formatIncomingWhatsAppMessage(payload) {
  return extractMessageFromWebhook(payload);
}

async function validateWebhookVerifyToken(req) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode !== "subscribe" || !token || !challenge) {
    return { ok: false, status: 400, mensagem: "Parâmetros de verificação inválidos." };
  }

  const globalToken = process.env.WHATSAPP_VERIFY_TOKEN_GLOBAL;
  if (globalToken && token === globalToken) {
    return { ok: true, challenge };
  }

  const { data, error } = await supabase
    .from("whatsapp_integracoes")
    .select("id")
    .eq("verify_token", token)
    .limit(1);

  if (error) throw error;
  if (data && data.length > 0) return { ok: true, challenge };

  return { ok: false, status: 403, mensagem: "Verify token inválido." };
}

function verifyMetaSignature(req) {
  // Preparado para validação futura com x-hub-signature-256 e app_secret.
  return true;
}

module.exports = {
  getWhatsAppConfigByEmpresa,
  getRawWhatsAppConfigByEmpresa,
  getWhatsAppConfigByPhoneNumberId,
  saveWhatsAppConfig,
  isWhatsAppEnabled,
  sendWhatsAppTextMessage,
  formatIncomingWhatsAppMessage,
  extractMessageFromWebhook,
  validateWebhookVerifyToken,
  verifyMetaSignature
};
