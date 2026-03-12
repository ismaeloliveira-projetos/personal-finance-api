# Personal Finance API

API para gerenciamento de finanças pessoais.

## 🚀 Tecnologias

- Node.js
- Fastify
- Prisma
- PostgreSQL
- Zod
- Better Auth

## 📦 Funcionalidades

- Criar transações
- Listar transações
- Atualizar transações
- Deletar transações
- Resumo financeiro (income, expense, balance)
- Listar categorias

## 📡 Endpoints

POST /transactions  
GET /transactions  
PUT /transactions/:id  
DELETE /transactions/:id  
GET /summary  
GET /categories

## 🗄 Banco de dados

Gerenciado com Prisma ORM.

## ▶️ Rodar o projeto

```bash
pnpm install
pnpm prisma migrate dev
pnpm dev
