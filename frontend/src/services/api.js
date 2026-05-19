import { API_URL } from "../config";

export function getToken() {
  return localStorage.getItem("ryanbot_token");
}

export async function api(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  let data = {};
  try { data = await res.json(); } catch {}

  if (res.status === 401) {
    logoutLocal();
  }

  if (!res.ok) {
    throw new Error(data.erro || data.mensagem || "Erro na requisição.");
  }

  return data;
}

export function logoutLocal() {
  localStorage.removeItem("ryanbot_token");
  localStorage.removeItem("ryanbot_usuario");
  localStorage.removeItem("ryanbot_empresaId");
}
