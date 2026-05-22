import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { api } from "../services/api";
import EmptyState from "../components/EmptyState";

const vazio = {
  ativo: false,
  phone_number_id: "",
  whatsapp_business_account_id: "",
  access_token: "",
  verify_token: "ryan-bot-webhook-2026",
  app_secret: "",
  numero_exibicao: ""
};

export default function WhatsAppConfig({ empresaId, usuario, showToast }) {
  const [form, setForm] = useState(vazio);
  const [telefoneTeste, setTelefoneTeste] = useState("");
  const [mensagemTeste, setMensagemTeste] = useState("Teste Ryan Bot Atendimento");
  const [resultado, setResultado] = useState(null);

  const permitido = ["superadmin", "cliente", "admin_empresa"].includes(usuario?.tipo);

  async function carregar() {
    if (!empresaId || !permitido) return;
    try {
      const data = await api(`/api/whatsapp-config?empresaId=${empresaId}`);
      setForm({ ...vazio, ...data });
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  useEffect(() => { carregar(); }, [empresaId]);

  if (!permitido) {
    return <EmptyState title="Acesso restrito" text="Atendentes não podem configurar WhatsApp." />;
  }

  function setField(k, v) {
    setForm(p => ({ ...p, [k]: v }));
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      const data = await api(`/api/whatsapp-config?empresaId=${empresaId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
      setForm({ ...vazio, ...data });
      showToast("Configuração do WhatsApp salva.");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function testarEnvio(e) {
    e.preventDefault();
    setResultado(null);

    try {
      const data = await api(`/api/whatsapp-config/testar-envio?empresaId=${empresaId}`, {
        method: "POST",
        body: JSON.stringify({ telefone: telefoneTeste, mensagem: mensagemTeste })
      });
      setResultado(data);
      showToast(data.enviado ? "Mensagem enviada." : data.motivo, data.enviado ? "success" : "error");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function copiar(texto) {
    navigator.clipboard.writeText(texto);
    showToast("Copiado.");
  }

  const webhookUrl = `${API_URL}/webhook/whatsapp`;

  return (
    <section className="two-columns">
      <form className="panel form-grid" onSubmit={salvar}>
        <h2>WhatsApp Cloud API</h2>
        <p>Configure a integração real da empresa com a API oficial da Meta.</p>

        <label className="checkbox-line">
          <input type="checkbox" checked={form.ativo} onChange={e => setField("ativo", e.target.checked)} />
          Integração ativa
        </label>

        <label>Phone Number ID</label>
        <input value={form.phone_number_id || ""} onChange={e => setField("phone_number_id", e.target.value)} />

        <label>WhatsApp Business Account ID</label>
        <input value={form.whatsapp_business_account_id || ""} onChange={e => setField("whatsapp_business_account_id", e.target.value)} />

        <label>Access Token</label>
        <input value={form.access_token || ""} onChange={e => setField("access_token", e.target.value)} placeholder="Cole o token aqui. Ele fica mascarado depois." />

        <label>Verify Token</label>
        <input value={form.verify_token || ""} onChange={e => setField("verify_token", e.target.value)} />

        <label>App Secret</label>
        <input value={form.app_secret || ""} onChange={e => setField("app_secret", e.target.value)} placeholder="Opcional nesta fase" />

        <label>Número de exibição</label>
        <input value={form.numero_exibicao || ""} onChange={e => setField("numero_exibicao", e.target.value)} placeholder="Ex: +55 21 99999-9999" />

        <button className="btn primary">Salvar integração</button>
      </form>

      <div className="list-area">
        <div className="panel form-grid">
          <h2>Dados para cadastrar na Meta</h2>

          <label>Callback URL / Webhook URL</label>
          <div className="copy-line">
            <input value={webhookUrl} readOnly />
            <button className="btn secondary" onClick={() => copiar(webhookUrl)}>Copiar</button>
          </div>

          <label>Verify Token</label>
          <div className="copy-line">
            <input value={form.verify_token || "ryan-bot-webhook-2026"} readOnly />
            <button className="btn secondary" onClick={() => copiar(form.verify_token || "ryan-bot-webhook-2026")}>Copiar</button>
          </div>

          <div className="error-box">
            Nunca coloque Access Token no frontend público. Ele fica salvo no backend/Supabase e aparece mascarado aqui.
          </div>
        </div>

        <form className="panel form-grid" onSubmit={testarEnvio}>
          <h2>Testar envio real</h2>
          <p>Use um telefone no formato internacional. Ex: 5521999999999</p>

          <label>Telefone</label>
          <input value={telefoneTeste} onChange={e => setTelefoneTeste(e.target.value)} placeholder="5521999999999" />

          <label>Mensagem</label>
          <textarea rows="4" value={mensagemTeste} onChange={e => setMensagemTeste(e.target.value)} />

          <button className="btn primary">Enviar teste</button>

          {resultado && (
            <pre className="code-box">{JSON.stringify(resultado, null, 2)}</pre>
          )}
        </form>
      </div>
    </section>
  );
}
