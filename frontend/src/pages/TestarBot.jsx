import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function TestarBot({ empresaId, empresas }) {
  const [telefone, setTelefone] = useState("5521999999999");
  const [nome, setNome] = useState("Cliente Teste");
  const [mensagem, setMensagem] = useState("Olá");
  const [respostas, setRespostas] = useState([]);
  const empresa = empresas.find(e => e.id === empresaId);

  useEffect(() => { setRespostas([]); }, [empresaId]);

  async function enviar(e) {
    e.preventDefault();

    const res = await fetch(`${API_URL}/webhook/simular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresaId, telefone, nome, mensagem })
    });

    const data = await res.json();
    setRespostas(p => [{ cliente: mensagem, bot: data.resposta || data.observacao || data.erro || "Sem resposta automática.", data: new Date().toLocaleString("pt-BR") }, ...p]);
    setMensagem("");
  }

  return (
    <section className="two-columns">
      <form className="panel form-grid" onSubmit={enviar}>
        <h2>Simular mensagem</h2>
        <p>Empresa testada: <strong>{empresa?.nome}</strong></p>
        <label>Telefone</label><input value={telefone} onChange={e => setTelefone(e.target.value)} />
        <label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} />
        <label>Mensagem do cliente</label><textarea rows="4" value={mensagem} onChange={e => setMensagem(e.target.value)} />
        <button className="btn primary">Enviar teste</button>
      </form>

      <div className="panel">
        <h2>Respostas do bot</h2>
        <div className="chat-box">
          {respostas.map((item, i) => (
            <div key={i} className="test-card">
              <div className="bubble cliente"><strong>Cliente</strong><p>{item.cliente}</p></div>
              <div className="bubble bot"><strong>Bot</strong><p>{item.bot}</p></div>
              <small>{item.data}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
