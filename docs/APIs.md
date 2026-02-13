# 📡 Status Page APIs Suportadas

Este documento lista todas as APIs e formatos de status page suportados pelo DevStatus.

## ✅ APIs Nativamente Suportadas

### 1. Atlassian Statuspage ⭐ (Mais Popular)
**Usado por:** 60%+ dos serviços (GitHub, Cloudflare, Vercel, Discord, etc.)

**Endpoints:**
```
/api/v2/summary.json  # Dados completos
/api/v2/status.json   # Status simplificado
```

**Estrutura:**
```json
{
  "page": { "id", "name", "url", "updated_at" },
  "components": [{ "id", "name", "status" }],
  "status": { "description", "indicator" }
}
```

**Configuração:** Não precisa especificar `statusPageType` (padrão)

---

### 2. Incident.io RSS 📡
**Usado por:** VTEX, e outros com RSS

**Endpoint:** `/feed.rss` ou `/rss`

**Exemplo real:** https://status.incident.io/feed.rss

**Formato:** XML com `<item>` para cada incidente

**Configuração:**
```typescript
{
  name: "VTEX",
  url: "https://status.vtex.com/",
  category: "E-commerce",
  statusPageType: "incidentio"
}
```

---

### 3. Status.io
**Usado por:** Alguns serviços enterprise

**Endpoints:**
```
/api/v2/status.json
/api/v2/summary.json
```

**Formato:** Similar ao Atlassian mas com estrutura diferente

**Exemplo:**
```typescript
{
  name: "Serviço Status.io",
  url: "https://status.exemplo.com/api/v2/status.json",
  category: "Cloud Provider",
  statusPageType: "statusio"
}
```

---

### 4. Better Stack (Better Uptime)
**Endpoint:** Status page pública em JSON

**Documentação:** https://betterstack.com/docs/uptime/api/

**Exemplo:**
```typescript
{
  name: "Serviço Better Stack",
  url: "https://status.exemplo.com/",
  category: "Monitoring",
  statusPageType: "betterstack"
}
```

---

### 5. Instatus
**Documentação:** https://instatus.com/help/api/

**Endpoints principais:**
- `/api/v1/status` - Status geral da página
- `/api/v1/incidents` - Lista de incidentes
- `/api/v1/maintenances` - Manutenções programadas

**Exemplo:**
```typescript
{
  name: "Serviço Instatus",
  url: "https://exemplo.instatus.com/",
  category: "SaaS",
  statusPageType: "instatus"
}
```

---

### 6. Cachet (Open Source)
**Endpoints:**
```
/api/v1/components
/api/v1/incidents
```

**Exemplo:**
```typescript
{
  name: "Serviço Cachet",
  url: "https://status.exemplo.com/api/v1/components",
  category: "Infrastructure",
  statusPageType: "cachet"
}
```

---

### 7. OpenStatus (Open Source)
**Docs:** https://docs.openstatus.dev/

**Endpoint:** `/feed/json`

**Exemplo:**
```typescript
{
  name: "Serviço OpenStatus",
  url: "https://status.exemplo.openstatus.dev/",
  category: "Monitoring",
  statusPageType: "openstatus"
}
```

---

### 8. Uptime Kuma (Self-hosted)
**Nota:** Cada instância Uptime Kuma tem URL própria. Não há API universal.

**Exemplo de URL:** `https://[sua-instancia].com/api/status-page/[slug]`

**Configuração manual necessária por instância.**

---

## 🔧 APIs Customizadas (Já Implementadas)

### Hotmart
- **Endpoint:** `/incidents` + `/services`
- **Formato:** JSON customizado
- **Parser:** `lib/hotmart-status.ts`

### AppMax
- **Endpoint:** `/api/getEventFeed/{id}`
- **Formato:** Eventos com tipo e status
- **Parser:** `lib/appmax-status.ts`

---

## 📋 APIs Específicas de Plataforma

### Google
**Para:** Google Workspace, GCP, Firebase

```typescript
{
  name: "Google Workspace",
  url: "https://www.google.com/appsstatus/dashboard/",
  category: "Productivity",
  statusPageType: "google"
}
```

### Microsoft
**Para:** Microsoft 365, Azure

```typescript
{
  name: "Microsoft 365",
  url: "https://status.cloud.microsoft/m365/",
  category: "Productivity",
  statusPageType: "microsoft"
}
```

### Apple
**Para:** Apple Developer, iCloud

```typescript
{
  name: "Apple Developer",
  url: "https://developer.apple.com/system-status/",
  category: "Developer Platform",
  statusPageType: "apple"
}
```

---

## 🛠️ Como Adicionar Novas APIs

### Passo 1: Identificar o formato

Tente acessar estas URLs comuns:
```
/api/v2/summary.json          # Atlassian
/api/v2/status.json           # Atlassian/Status.io
/feed.rss                     # RSS/Incident.io
/rss                          # RSS
/api/v1/components            # Cachet
/api/status                   # Custom
/status.json                  # Custom
```

### Passo 2: Criar parser

Crie um arquivo em `/lib/{nome}-status.ts`:

```typescript
import type { WebsiteData } from "@/types";

export async function parseProviderStatus(
  url: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Transforme os dados no formato WebsiteData
    return {
      page: {
        id: serviceName,
        name: serviceName,
        url: url,
        updated_at: new Date().toISOString(),
      },
      components: data.components || [],
      status: {
        description: data.status?.description || "Operational",
        indicator: data.status?.indicator || "none",
      },
      category,
      url,
      statusPageType: "provider",
      name: serviceName,
    };
  } catch (error) {
    // Retorne estado de erro
    return {
      page: { id: serviceName, name: serviceName, url, updated_at: new Date().toISOString() },
      components: [],
      status: { description: "Error fetching status", indicator: "error" },
      category,
      url,
      statusPageType: "provider",
      name: serviceName,
    };
  }
}
```

### Passo 3: Integrar no page.tsx

Adicione no switch de `statusPageType` em `app/page.tsx`:

```typescript
if (website.statusPageType === "provider") {
  return await parseProviderStatus(
    website.url,
    website.name,
    website.category
  );
}
```

### Passo 4: Adicionar ao types

Atualize `types/index.ts` se necessário:

```typescript
export type StatusPageType = 
  | "atlassian" 
  | "custom"
  | "incidentio"
  | "provider"  // novo
  | ...;
```

---

## 📊 Cobertura Atual

| Provedor | % do Mercado | Status |
|----------|-------------|---------|
| Atlassian Statuspage | ~65% | ✅ Suportado |
| Incident.io | ~8% | ✅ Suportado |
| Status.io | ~5% | ✅ Parser implementado |
| Better Stack | ~4% | ✅ Parser implementado |
| Instatus | ~3% | ✅ Parser implementado |
| OpenStatus | ~1% | ✅ Parser implementado |
| Cachet | ~2% | ⚠️ Parser básico possível |
| Uptime Kuma | Variável | ⚠️ Self-hosted (por instância) |
| Custom/Proprietário | ~12% | 🔧 Case-by-case |

**Total coberto:** ~90% dos serviços do mercado

---

## 🎯 Roadmap

### Prioridade Alta
- [x] Parser dedicado para Status.io ✅
- [x] Parser para Better Stack ✅
- [x] Parser para OpenStatus ✅
- [ ] Suporte a webhooks para atualizações em tempo real

### Prioridade Média
- [x] Parser para Instatus ✅
- [ ] Parser para Cachet
- [ ] Parser genérico para Uptime Kuma (por instância)
- [ ] Auto-detecção de tipo de API

### Prioridade Baixa
- [ ] Cache local com TTL
- [ ] Fallback para múltiplas fontes
- [ ] Notificações de incidentes

---

## 💡 Dicas

1. **Sempre teste a URL** antes de adicionar
2. **Verifique CORS** - algumas APIs bloqueiam requisições do browser
3. **Use o network tab** do DevTools para descobrir endpoints
4. **Documente parsers customizados** neste arquivo

---

## 📚 Recursos

- [Atlassian Statuspage API Docs](https://developer.statuspage.io/)
- [Incident.io API Docs](https://api-docs.incident.io/)
- [Cachet API Docs](https://docs.cachethq.io/)
- [Better Stack API](https://betterstack.com/docs/uptime/api/)
