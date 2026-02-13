# 🤝 Contribuindo com o DevStatus

Obrigado por querer contribuir! Este guia vai te ajudar a adicionar novos serviços corretamente.

## 📝 Antes de enviar uma PR

### 1. Verifique se o serviço já existe

```bash
npm run validate
```

Ou busque no arquivo `data/sites.ts`:
- Por nome (case-insensitive)
- Por URL/domínio similar

### 2. Checklist de qualidade

- [ ] O serviço não está duplicado
- [ ] A URL da status page está correta e acessível
- [ ] Usei uma categoria existente ou criei uma nova coerente
- [ ] Testei localmente (`npm run dev`)

## 🏷️ Categorias aceitas

Use uma das categorias existentes quando possível:

- **AI Code Editor** - Cursor, Windsurf, Zed
- **AI/ML** - OpenAI, Claude, Replicate, Hugging Face
- **Cloud Provider** - Vercel, AWS, GCP, Azure
- **Database** - Supabase, PlanetScale, MongoDB
- **CDN** - Cloudflare, Fastly
- **Version Control** - GitHub, GitLab, Bitbucket
- **CI/CD** - CircleCI, Travis CI
- **Communication** - Discord, Slack, Zoom
- **Productivity** - Notion, Linear, Google Workspace
- **Design** - Figma, Framer, Canva
- **E-commerce** - Shopify, Stripe, VTEX
- **Payment** - PayPal, Pagar.me
- **Security** - 1Password, Auth0
- **Monitoring** - DataDog, Sentry
- **Meta** - Facebook, Instagram, WhatsApp

> 💡 Se nenhuma categoria se encaixa perfeitamente, use a mais próxima ou crie uma nova com bom senso.

## 🔗 Formatos de URL suportados

### Atlassian Statuspage (recomendado)
```typescript
{
  name: "Nome do Serviço",
  url: `https://status.exemplo.com/api/v2/summary.json`,
  category: "Categoria",
}
```

### Status pages customizadas
```typescript
{
  name: "Nome do Serviço",
  url: "https://status.exemplo.com/",
  category: "Categoria",
  statusPageType: "custom",
}
```

Tipos disponíveis:
- `"atlassian"` - Padrão, não precisa especificar
- `"custom"` - Páginas customizadas
- `"google"` - Google Workspace/Cloud
- `"microsoft"` - Microsoft 365
- `"incidentio"` - Incident.io
- `"apple"` - Apple Developer
- `"hotmart"` - Hotmart
- `"appmax"` - AppMax

## ⚠️ Páginas de status compartilhadas

Alguns serviços compartilham a mesma página de status (ex: Google Cloud, Meta, Microsoft 365). Isso é **intencional e permitido**.

Se você encontrar uma URL que já existe para outro serviço, verifique se é realmente o mesmo serviço ou se compartilham a mesma página de status.

## 🧪 Testando localmente

```bash
# Instalar dependências
npm install

# Rodar validações
npm run validate

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🚀 Fluxo de contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b add/nome-do-servico`
3. Adicione o serviço em `data/sites.ts`
4. Rode `npm run validate` para verificar
5. Commit: `git commit -m "Add: Nome do Serviço"`
6. Push: `git push origin add/nome-do-servico`
7. Abra a PR com o template preenchido

## ❓ Dúvidas?

Abra uma [issue](../../issues) se tiver dúvidas sobre:
- Se um serviço se encaixa no projeto
- Qual categoria usar
- Problemas com o script de validação

---

**Lembre-se:** O script de validação roda automaticamente em toda PR. Se ele falhar, a PR não poderá ser mergeada!
