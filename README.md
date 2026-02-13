# 🚀 DevStatus

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/birobirobiro/DevStatus)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)

Dashboard unificado para monitorar o status de mais de 140 serviços de desenvolvimento, cloud, SaaS e APIs em tempo real.

![DevStatus Screenshot](public/screenshot.png)

## ✨ Features

- 📊 **140+ Serviços** - De provedores cloud a ferramentas de desenvolvimento
- 🔍 **Busca e Filtros** - Encontre rapidamente o que precisa
- ❤️ **Favoritos** - Salve seus serviços mais importantes
- 🔔 **Relatórios** - Comunidade pode reportar problemas
- 📱 **Responsivo** - Funciona em qualquer dispositivo
- ⚡ **Performance** - Atualizações otimizadas
- 🎨 **UI Moderna** - Design clean e profissional

## 🛠️ Stack

- **Framework:** [Next.js 15](https://nextjs.org) com App Router
- **Language:** [TypeScript](https://typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **State:** React Hooks + nuqs (URL state)
- **Icons:** [Lucide React](https://lucide.dev)

## 🚀 Getting Started

### Pré-requisitos

- Node.js 20+
- pnpm (recomendado) ou npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/birobirobiro/DevStatus.git
cd DevStatus

# Instale as dependências
pnpm install

# Rode o servidor de desenvolvimento
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Scripts disponíveis

```bash
pnpm dev      # Desenvolvimento com hot reload
pnpm build    # Build de produção (com validação)
pnpm start    # Inicia servidor de produção
pnpm lint     # ESLint
pnpm validate # Valida sites.ts manualmente
```

## 📝 Adicionando novos serviços

Edite `data/sites.ts`:

```typescript
{
  name: "Nome do Serviço",
  url: `https://status.exemplo.com/api/v2/summary.json`,
  category: "Cloud Provider",
}
```

Para páginas de status customizadas:

```typescript
{
  name: "Nome do Serviço",
  url: "https://status.exemplo.com/",
  category: "Categoria",
  statusPageType: "custom",
}
```

> ⚠️ **Importante:** Rode `pnpm validate` antes de commitar para verificar duplicados e erros.

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes completos.

## 🏷️ Categorias suportadas

- **Cloud Providers:** AWS, GCP, Azure, Vercel, Netlify, Fly.io
- **AI/ML:** OpenAI, Claude, Replicate, Hugging Face, DeepSeek
- **Databases:** Supabase, PlanetScale, MongoDB, Neon
- **Communication:** Discord, Slack, Zoom, Telegram
- **Version Control:** GitHub, GitLab, Bitbucket
- **Productivity:** Notion, Linear, Figma, Google Workspace
- **E-commerce:** Shopify, Stripe, VTEX, Hotmart
- E muito mais...

## 🔧 Status Page Types

O projeto suporta diferentes tipos de páginas de status:

| Type | Descrição | Exemplo |
|------|-----------|---------|
| `atlassian` | Padrão (não precisa especificar) | GitHub, Vercel |
| `custom` | Páginas customizadas | Railway, Deno |
| `google` | Google Workspace/Cloud | GCP, Gmail |
| `microsoft` | Microsoft 365 | Teams, Outlook |
| `incidentio` | Incident.io | VTEX |
| `apple` | Apple Developer | Apple Dev |
| `hotmart` | Hotmart | Hotmart |
| `appmax` | AppMax | AppMax |

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/novo-servico`)
3. Commit suas mudanças (`git commit -m 'Add: Novo serviço'`)
4. Push para a branch (`git push origin feature/novo-servico`)
5. Abra um Pull Request

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes detalhadas.

## 🧪 Validação automática

Toda PR é automaticamente validada via GitHub Actions:

- ✅ Verifica duplicados (nomes e URLs)
- ✅ Valida formato das URLs
- ✅ Verifica categorias
- ✅ Checa statusPageType válidos

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Ícones por [Lucide](https://lucide.dev)
- UI Components por [shadcn/ui](https://ui.shadcn.com)
- Status pages por [Atlassian Statuspage](https://www.atlassian.com/software/statuspage)

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/birobirobiro">@birobirobiro</a>
</p>
