function normalizeEmpresaId(req) {
  return req.query.empresaId || req.body.empresaId || req.params.empresaId;
}

function isSuperadmin(user) {
  return user?.tipo === "superadmin";
}

function isAdminLike(user) {
  return ["superadmin", "admin_empresa", "cliente"].includes(user?.tipo);
}

function canAccessEmpresa(req, res, next) {
  if (isSuperadmin(req.user)) return next();

  const empresaId = normalizeEmpresaId(req);
  if (!empresaId) return res.status(400).json({ erro: "empresaId é obrigatório." });

  if (empresaId !== req.user.empresaId) {
    return res.status(403).json({ erro: "Você não tem permissão para acessar essa empresa." });
  }

  next();
}

function onlySuperadmin(req, res, next) {
  if (!isSuperadmin(req.user)) return res.status(403).json({ erro: "Apenas superadmin pode realizar essa ação." });
  next();
}

function blockAtendente(req, res, next) {
  if (req.user?.tipo === "atendente") return res.status(403).json({ erro: "Atendente não tem permissão para essa ação." });
  next();
}

function canManageUsers(req, res, next) {
  if (isSuperadmin(req.user)) return next();
  if (["admin_empresa", "cliente"].includes(req.user.tipo)) return canAccessEmpresa(req, res, next);
  return res.status(403).json({ erro: "Você não pode gerenciar usuários." });
}

function canViewAtendimentos(req, res, next) {
  if (isSuperadmin(req.user)) return next();
  if (["admin_empresa", "cliente", "atendente"].includes(req.user.tipo)) return canAccessEmpresa(req, res, next);
  return res.status(403).json({ erro: "Você não pode ver atendimentos." });
}

module.exports = {
  canAccessEmpresa,
  onlySuperadmin,
  blockAtendente,
  canManageUsers,
  canViewAtendimentos,
  isSuperadmin,
  isAdminLike
};
