# Briefing — CanvaLabel (LabelCraft AI)

## Visão Geral
Plataforma SaaS para criação de rótulos e etiquetas profissionais em conformidade com ANVISA.
O assinante acessa um dashboard com gerador de rótulos com IA + editor visual (tipo Photoshop/Canva).

## Stack
- **Framework:** Next.js (App Router) + React + TypeScript
- **Estilização:** TailwindCSS
- **Componentes:** Shadcn/ui + Radix UI
- **Ícones:** React Icons
- **Animações:** Framer Motion
- **Validação:** Zod
- **Data Fetching:** React Query (TanStack Query)
- **ORM:** Prisma + PostgreSQL
- **Auth:** JWT (login/senha)
- **Pagamentos:** Asaas (Pix, Boleto, Cartão)
- **IA:** Grok, DALL-E, Midjourney, Leonardo AI
- **Gerenciador:** pnpm

## Design System
- **Cores:** Branco, Cinza, Azul (degradê nos botões, badges, CTAs)
- **Fonte:** Moderna e elegante (Inter/Plus Jakarta Sans)
- **Estilo:** Neomorphism, Glassmorphism, Blur Light Brush, Design Lines, Patterns
- **Nível:** Alto padrão visual, sofisticado

## Database Schema (Prisma)

### Admin
- id, email, password, name, role, createdAt, updatedAt

### Subscriber (Assinante)
- id, cpfOrCnpj, name, email, password, avatar, city, state, street, number, neighborhood, country, phone
- plans[] (relação com Plan)
- createdAt, updatedAt

### Plan (Plano)
- id, name, description, benefits[]
- type: MONTHLY | QUARTERLY | SEMIANNUAL | ANNUAL | LIFETIME
- price, promotionalPrice
- subscribers[] (relação com Subscriber)
- createdAt, updatedAt

### SiteMetrics (Métricas do Site)
- id, clicks, views, uniqueVisitors, pageViews, bounceRate
- date, createdAt

### Payment (Pagamento)
- id, subscriberId, planId, amount, method (PIX | BOLETO | CARD)
- status (PENDING | CONFIRMED | CANCELLED | REFUNDED)
- asaasPaymentId, asaasInvoiceUrl
- createdAt, updatedAt

### AIModel (Modelos de IA)
- id, name, provider (GROK | DALLE | MIDJOURNEY | LEONARDO)
- apiKey, baseUrl, isActive
- createdAt, updatedAt

### SubscriberModel (Modelos do Assinante)
- id, subscriberId, name, thumbnail, canvasData (JSON)
- createdAt, updatedAt

### Template (Mocks e Templates)
- id, name, category, thumbnail
- background, width, height, colors[], fonts[]
- canvasData (JSON), isPublic
- createdAt, updatedAt

## Páginas

### / (Home — Landing Page)
Componentes:
1. **Header** — Logo, nav, CTA login/assinar
2. **HeroHome** — Título impactante, subtítulo, CTA, visual sofisticado
3. **BeneficiosCarrousel** — Carrossel de benefícios da plataforma
4. **DemonstrationCentral** — Framer Motion interativo demonstrando a plataforma
5. **Planos** — Cards de preços com destaque no popular
6. **Avaliacoes** — Depoimentos/reviews de clientes
7. **Footer** — Links, redes sociais, copyright

### /login
- Form centralizado
- Esqueci minha senha inline (some o form de login, aparece campo de email para recuperação)
- Sem "criar conta" (só assinantes)
- Link "Assinar plano" que redireciona para seção de planos na Home

### /dashboard (Assinante)
- Gerador de rótulos com IA
- Editor visual (redimensionar, mudar foto, cores, fontes, etc.)
- Modelos salvos
- Histórico de gerações

### /admin
- Gestão de assinantes
- Gestão de planos
- Métricas do site
- Configuração de modelos de IA
- Templates/Mocks

## Referências de Código
- `/home/willian/Área de Trabalho/abridorcard/app/admin/ai-generator`
- `/home/willian/Área de Trabalho/abridorcard/app/admin/editor`
- `/home/willian/Área de Trabalho/abridorcard/app/admin/templates`
- `/home/willian/Área de Trabalho/abridorcard/app/admin/templates-list`

## Documento Regulatório
- `treino ia - anvisa .pdf` — Regras ANVISA para validação de rótulos (tabela nutricional, rotulagem frontal, bebidas, etc.)
