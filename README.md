# Ryan Bot Atendimento V4

Versão com Supabase, JWT, bcrypt, cadastro de usuários, permissões reais e estrutura futura para WhatsApp Cloud API.

## O que mudou

- Dados saíram dos arquivos JSON e foram para Supabase.
- Login agora usa JWT.
- Senhas usam bcrypt.
- Existe cadastro de usuários por empresa.
- Existem permissões por tipo de usuário.
- Atendente tem acesso limitado.
- Webhook simulado continua funcionando.
- WhatsApp real ainda não foi conectado.

## 1. Criar projeto no Supabase

1. Entre em https://supabase.com
2. Crie um projeto novo.
3. Vá em SQL Editor.
4. Execute `backend/supabase/schema.sql`.
5. Execute `backend/supabase/seed.sql`.

## 2. Variáveis do backend

Crie `backend/.env` baseado no `.env.example`:

```txt
SUPABASE_URL=SUA_URL_DO_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
JWT_SECRET=uma-chave-grande-e-secreta
PORT=3001
NODE_ENV=development
```

A `SERVICE_ROLE_KEY` fica em Supabase > Project Settings > API.

## 3. Rodar backend local

```powershell
cd "C:\Users\Admin\OneDrive\Área de Trabalho\meu sites\ryan-bot-atendimento-v4\backend"
npm install
npm run dev
```

Backend:
```txt
http://localhost:3001
```

## 4. Rodar frontend local

Crie `frontend/.env`:

```txt
VITE_API_URL=http://localhost:3001
```

Depois:

```powershell
cd "C:\Users\Admin\OneDrive\Área de Trabalho\meu sites\ryan-bot-atendimento-v4\frontend"
npm install
npm run dev
```

Frontend:
```txt
http://localhost:5173/
```

## 5. Logins iniciais

```txt
admin@ryanbot.com
123456
```

```txt
portcell@cliente.com
123456
```

```txt
atendente@portcell.com
123456
```

## 6. Render

No Render, configure as variáveis:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
NODE_ENV=production
```

Configuração:

```txt
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

## 7. Vercel

Na Vercel, configure a variável:

```txt
VITE_API_URL=https://SUA-URL-DO-RENDER.onrender.com
```

Configuração:

```txt
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

## 8. Testes

1. Login superadmin.
2. Login cliente.
3. Login atendente.
4. Criar empresa.
5. Criar usuário.
6. Redefinir senha.
7. Criar menu.
8. Simular atendimento.
9. Responder manualmente.
10. Tentar limpar atendimentos como atendente e ver bloqueio.
11. Redeploy no Render e confirmar que dados continuam no Supabase.

## 9. Observação importante

Esta versão não usa mais os arquivos JSON como banco. Para funcionar, o Supabase precisa estar configurado e as variáveis de ambiente precisam estar preenchidas.
