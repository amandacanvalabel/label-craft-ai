# CanvaLabel

Plataforma para criação de rótulos de cosméticos profissionais e em conformidade com a ANVISA, com criação assistida por IA, revisor automático da RDC 907/2024 e exportação pronta para gráfica.

🌐 **Site:** [canvalabel.com](https://www.canvalabel.com)

---

## Sobre este repositório

Este repositório contém o **protótipo navegável** do produto CanvaLabel — landing page, autenticação e aplicativo unificados em um único arquivo HTML, mais a documentação de referência. É o protótipo evolutivo que orienta a construção da versão de produção.

> ⚠️ **Protótipo:** autenticação e dados são simulados (mockados) e salvos no `localStorage` do navegador. Nenhuma senha real é armazenada. A persistência vale apenas no navegador local; em produção, será substituída por backend (ver "Stack futura").

---

## Arquivos

```
.
├── index.html                  # Produto completo: landing → login/signup → app + painel admin
├── landing.html                # Apenas a landing page (vitrine)
└── docs/
    ├── checklists.html          # Checklists: funções do admin, edição da LP e conteúdo da LP
    └── checklist-funcoes.html   # Checklist das funções do usuário final
```

### `index.html` — o produto completo

Fluxo de ponta a ponta em um arquivo só:

- **Landing page** — hero, recursos, planos, depoimentos, FAQ, rodapé, páginas internas (Termos, Privacidade, Cookies, Sobre, Contato)
- **Autenticação** (simulada) — signup, login e botão Google
- **App** — wizard de criação de rótulos, editor visual, revisor ANVISA, organização em pastas
- **Monetização** — planos (Free / Starter / Profissional), limites de uso, checkout completo (cartão/PIX, cupons, mensal/anual)
- **Suporte** — assistente com IA + atendimento humano, com anexos
- **Painel administrativo** — visão geral, usuários, planos e pacotes, cupons, comunicação, suporte, logs de atividade, funil de conversão, editor da landing (CMS) e integrações

#### Como entrar no painel administrativo

1. Na landing, clique em **Entrar**
2. E-mail: `amanda@canvalabel.com.br` · Senha: qualquer valor
3. No app, clique no avatar → **Painel administrativo**

---

## Como abrir localmente

Não há instalação nem dependências de build. Basta abrir o arquivo no navegador:

```bash
open index.html        # macOS
# ou dê duplo-clique no arquivo
```

---

## Stack

**Protótipo (este repositório):** HTML + CSS + JavaScript puro, sem framework. Bibliotecas via CDN (jsPDF, html2canvas, qrcode-generator). Persistência em `localStorage`.

**Stack futura (produção):**

- **Frontend:** Next.js + React
- **Backend / Auth / Banco:** Supabase
- **Pagamentos:** Stripe
- **Hospedagem:** Vercel
- **IA:** OpenAI / Anthropic (geração de conteúdo)

---

## Documentação

Os checklists em `docs/` listam todas as funcionalidades do produto e servem como referência de escopo para o time de desenvolvimento.

---

## Avisos

- Os textos das páginas legais (Termos, Privacidade, Cookies) são **modelos** e devem ser revisados por um profissional jurídico antes de qualquer uso em produção.
- O revisor de conformidade é uma ferramenta de apoio e não substitui a análise de um profissional regulatório responsável.

---

## Licença

Todos os direitos reservados © 2026 CanvaLabel.
