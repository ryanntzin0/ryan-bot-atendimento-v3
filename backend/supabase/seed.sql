-- Execute depois do schema.sql no SQL Editor do Supabase.
-- As senhas iniciais são: 123456

insert into empresas (nome, slug, ativo, plano, cor_principal)
values
  ('Ryan Studios', 'ryan-studios', true, 'Profissional', '#8b5cf6'),
  ('Portcell', 'portcell', true, 'Inicial', '#22d3ee')
on conflict (slug) do nothing;

insert into usuarios (empresa_id, nome, email, senha_hash, tipo, ativo)
select id, 'Admin Ryan', 'admin@ryanbot.com', crypt('123456', gen_salt('bf')), 'superadmin', true
from empresas where slug = 'ryan-studios'
on conflict (email) do nothing;

insert into usuarios (empresa_id, nome, email, senha_hash, tipo, ativo)
select id, 'Portcell Admin', 'portcell@cliente.com', crypt('123456', gen_salt('bf')), 'cliente', true
from empresas where slug = 'portcell'
on conflict (email) do nothing;

insert into usuarios (empresa_id, nome, email, senha_hash, tipo, ativo)
select id, 'Atendente Portcell', 'atendente@portcell.com', crypt('123456', gen_salt('bf')), 'atendente', true
from empresas where slug = 'portcell'
on conflict (email) do nothing;

insert into config_bots (
  empresa_id, empresa_nome, bot_ativo, mensagem_saudacao,
  mensagem_opcao_invalida, mensagem_finalizacao, mensagem_fora_horario,
  mostrar_menu_na_saudacao, horarios
)
select
  id,
  nome,
  true,
  'Olá! Seja bem-vindo(a) à ' || nome || ' 👋' || chr(10) || 'Como podemos ajudar?',
  'Não entendi sua opção 😅' || chr(10) || 'Digite uma opção válida.',
  'Atendimento encerrado com sucesso ✅',
  'Estamos fora do horário de atendimento.',
  true,
  '{
    "segunda": {"ativo": true, "inicio": "00:00", "fim": "23:59"},
    "terca": {"ativo": true, "inicio": "00:00", "fim": "23:59"},
    "quarta": {"ativo": true, "inicio": "00:00", "fim": "23:59"},
    "quinta": {"ativo": true, "inicio": "00:00", "fim": "23:59"},
    "sexta": {"ativo": true, "inicio": "00:00", "fim": "23:59"},
    "sabado": {"ativo": true, "inicio": "00:00", "fim": "23:59"},
    "domingo": {"ativo": true, "inicio": "00:00", "fim": "23:59"}
  }'::jsonb
from empresas
on conflict (empresa_id) do nothing;

insert into menus (empresa_id, numero, titulo, resposta, acao, ativo, ordem)
select id, '1', 'Vendas', 'Você escolheu Vendas 🛒' || chr(10) || 'Informe o que procura.', 'responder', true, 1 from empresas
on conflict (empresa_id, numero) do nothing;

insert into menus (empresa_id, numero, titulo, resposta, acao, ativo, ordem)
select id, '2', 'Suporte', 'Você escolheu Suporte 🛠️' || chr(10) || 'Descreva sua dúvida.', 'responder', true, 2 from empresas
on conflict (empresa_id, numero) do nothing;

insert into menus (empresa_id, numero, titulo, resposta, acao, ativo, ordem)
select id, '3', 'Falar com atendente', 'Certo! Vou encaminhar para um atendente humano 👨‍💻', 'humano', true, 3 from empresas
on conflict (empresa_id, numero) do nothing;

insert into menus (empresa_id, numero, titulo, resposta, acao, ativo, ordem)
select id, '4', 'Encerrar atendimento', 'Atendimento encerrado com sucesso ✅', 'finalizar', true, 4 from empresas
on conflict (empresa_id, numero) do nothing;
