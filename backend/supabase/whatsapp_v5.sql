create table if not exists whatsapp_integracoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null unique references empresas(id) on delete cascade,
  ativo boolean not null default false,
  phone_number_id text,
  whatsapp_business_account_id text,
  access_token text,
  verify_token text,
  app_secret text,
  numero_exibicao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_whatsapp_integracoes_empresa on whatsapp_integracoes(empresa_id);
create index if not exists idx_whatsapp_integracoes_phone_number_id on whatsapp_integracoes(phone_number_id);
create index if not exists idx_whatsapp_integracoes_verify_token on whatsapp_integracoes(verify_token);
