export default function EmpresaSelector({ usuario, empresas, empresaId, setEmpresaId }) {
  const empresaAtual = empresas.find(e => e.id === empresaId);

  if (!usuario) return null;

  if (usuario.tipo !== "superadmin") {
    return <div className="company-pill">{empresaAtual?.nome || "Minha empresa"}</div>;
  }

  return (
    <select className="company-select" value={empresaId || ""} onChange={(e) => setEmpresaId(e.target.value)}>
      {empresas.map((empresa) => (
        <option key={empresa.id} value={empresa.id}>{empresa.nome} — {empresa.plano}</option>
      ))}
    </select>
  );
}
