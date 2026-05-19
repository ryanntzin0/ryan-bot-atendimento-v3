create extension if not exists "pgcrypto";

create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ativo boolean not null default true,
  plano text not null default 'Inicial',
  cor_principal text not null default '#8b5cf6',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id) on delete cascade,
  nome text not null,
  email text not null unique,
  senha_hash text not null,
  tipo text not null check (tipo in ('superadmin', 'admin_empresa', 'atendente', 'cliente')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists config_bots (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null unique references empresas(id) on delete cascade,
  empresa_nome text not null,
  bot_ativo boolean not null default true,
  mensagem_saudacao text not null,
  mensagem_opcao_invalida text not null,
  mensagem_finalizacao text not null,
  mensagem_fora_horario text not null,
  mostrar_menu_na_saudacao boolean not null default true,
  horarios jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  numero text not null,
  titulo text not null,
  resposta text not null,
  acao text not null default 'responder' check (acao in ('responder', 'pedir_info', 'humano', 'finalizar', 'submenu')),
  ativo boolean not null default true,
  ordem integer not null default 1,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (empresa_id, numero)
);

create table if not exists atendimentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  telefone text not null,
  nome text,
  status text not null default 'iniciado',
  ultima_mensagem text default '',
  opcao_escolhida text default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists mensagens_atendimento (
  id uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references atendimentos(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  de text not null check (de in ('cliente', 'bot', 'atendente')),
  texto text not null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_usuarios_empresa on usuarios(empresa_id);
create index if not exists idx_menus_empresa on menus(empresa_id);
create index if not exists idx_atendimentos_empresa on atendimentos(empresa_id);
create index if not exists idx_mensagens_atendimento on mensagens_atendimento(atendimento_id);
