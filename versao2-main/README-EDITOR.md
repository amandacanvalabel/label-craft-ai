# CanvaLabel

Plataforma inteligente para criação de rótulos e etiquetas em conformidade com a ANVISA.

🌐 **Site:** [canvalabel.com](https://www.canvalabel.com)

---

## Sobre o projeto

CanvaLabel permite criar rótulos profissionais para cosméticos, alimentos, bebidas e suplementos com geração assistida por IA, validação automática conforme RDC 907/2024 (ANVISA) e exportação pronta para gráfica.

### Principais features

- **Wizard de criação em 13 etapas** agrupadas em 5 fases (Briefing, Conteúdo, Geração, Edição, Produção)
- **Editor visual** com rich text, camadas, formas, selos, QR Code, código de barras
- **Revisor ANVISA** — validação automática conforme 18 regras da RDC 907/2024
- **PDF técnico** completo com capa, faces, máscaras de acabamento e faca cotada
- **Preview profissional** com efeitos visuais dos acabamentos (hot stamping, verniz, baixo relevo)
- **Modo claro/escuro** com detecção automática do sistema
- **Save/load de projetos** com auto-save

---

## Estrutura do repositório

```
canvalabel-editor/
├── editor/                    # Editor MVP (HTML único)
│   └── canvalabel-parte3q.html
├── docs/                      # Documentação (PRD, especificações)
└── assets/
    └── frascos/               # Imagens de embalagens (Bepack)
```

---

## Stack atual

- HTML + CSS + JavaScript vanilla (sem framework, ~580KB)
- Bibliotecas externas via CDN:
  - jsPDF 2.5.1 (geração de PDF)
  - html2canvas 1.4.1 (rasterização)
  - qrcode-generator 1.4.4 (QR codes)
- Persistência via localStorage

### Stack futura (próximas fases)

- **Frontend:** Next.js + React
- **Backend:** Supabase (auth, banco, storage)
- **Pagamentos:** Stripe
- **Hospedagem:** Vercel
- **IA:** OpenAI ou Anthropic (geração de conteúdo)

---

## Como abrir localmente

```bash
# Basta abrir o HTML no navegador
open editor/canvalabel-parte3q.html
```

Não há dependências de instalação — tudo roda no browser.

---

## Versões

Histórico de iterações em `docs/CHANGELOG.md` (em construção).

---

## Status do projeto

**Em desenvolvimento ativo.** Versão atual em produção em [canvalabel.com](https://www.canvalabel.com).

Este repositório contém o protótipo evolutivo que vai substituir/melhorar a versão atualmente no ar.

---

## Licença

Todos os direitos reservados © 2026 CanvaLabel.
