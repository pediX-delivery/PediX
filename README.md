# PediX

Plataforma SaaS multi-tenant para restaurantes, construída com Next.js, Supabase e Vercel.

## Estado atual

- Fundação visual inicial em Next.js App Router.
- Projeto Supabase provisionado em São Paulo.
- Esquema PostgreSQL multi-tenant inicial com RLS habilitado.
- Projeto Vercel conectado ao repositório GitHub.
- Autenticação, autorização por papel, checkout e operações ainda estão em desenvolvimento.

## Requisitos

- Node.js 20.9+
- npm

## Configuração local

1. Instale as dependências: `npm install`.
2. Copie `.env.example` para `.env.local`.
3. Preencha as variáveis públicas do Supabase no ambiente local.
4. Execute `npm run dev`.

## Variáveis de ambiente

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Nunca coloque a chave `service_role` ou qualquer segredo em variáveis `NEXT_PUBLIC_*`, no navegador ou no repositório.

## Princípios de arquitetura

- Isolamento entre restaurantes por `restaurant_id`.
- RLS no banco como camada obrigatória de autorização.
- Validação de preços e transições de pedidos no servidor.
- Nenhuma confiança em valores enviados pelo navegador para totalização de pedidos.
- Dados de clientes e pedidos sempre limitados ao restaurante correspondente.
