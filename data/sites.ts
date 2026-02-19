import type { WebsiteEntry } from "@/types";

export const base_url_atlassian = "api/v2/summary.json";

// Lista de domínios que usam status pages próprias ou de terceiros
// mas não fornecem API compatível com Atlassian
const externalStatusDomains = [
  "fastlystatus.com",
  "status.strapi.io",
  "replicatestatus.com",
  "status.okta.com",
  "status.postmarkapp.com",
  "status.jetbrains.com",
  "status.heroku.com",
  "status.gitlab.com",
  "status.auth0.com",
  "status.framer.com",
  "framerstatus.com",
  "status.algolia.com",
];

// ============================================================================
// AI CODE EDITORS
// ============================================================================
const aiCodeEditors: WebsiteEntry[] = [
  { name: "Cursor", url: `https://status.cursor.com/${base_url_atlassian}`, category: "AI Code Editor" },
  { name: "Windsurf", url: `https://status.windsurf.com/${base_url_atlassian}`, category: "AI Code Editor" },
  { name: "Zed", url: "https://status.zed.dev/", category: "AI Code Editor", statusPageType: "custom" },
  { name: "Kilo Code", url: "https://status.kilo.ai/", category: "AI Code Editor", statusPageType: "betterstack" },
  { name: "v0", url: "https://v0-status.com/", category: "AI Code Editor", statusPageType: "incidentio" },
  { name: "Bolt.new", url: "https://status.bolt.new/", category: "AI Code Editor", statusPageType: "incidentio" },
];

// ============================================================================
// AI / ML SERVICES
// ============================================================================
const aiMLServices: WebsiteEntry[] = [
  { name: "OpenAI", url: `https://status.openai.com/${base_url_atlassian}`, category: "AI/ML" },
  { name: "Claude (Anthropic)", url: `https://status.claude.com/api/v2/status.json`, category: "AI/ML" },
  { name: "Replicate", url: "https://www.replicatestatus.com/", category: "AI/ML", statusPageType: "incidentio" },
  { name: "Hugging Face", url: "https://status.huggingface.co/", category: "AI/ML", statusPageType: "custom" },
  { name: "Midjourney", url: "https://status.midjourney.com/", category: "AI/ML", statusPageType: "custom" },
  { name: "Stability AI", url: "https://status.stability.ai/", category: "AI/ML", statusPageType: "custom" },
  { name: "Cohere", url: "https://status.cohere.ai/", category: "AI/ML", statusPageType: "custom" },
  { name: "Mistral AI", url: "https://status.mistral.ai/", category: "AI/ML", statusPageType: "custom" },
  { name: "DeepSeek", url: `https://status.deepseek.com/api/v2/status.json`, category: "AI/ML" },
  { name: "Perplexity", url: "https://status.perplexity.com/", category: "AI/ML", statusPageType: "custom" },
  { name: "ElevenLabs", url: "https://status.elevenlabs.io/", category: "AI/ML", statusPageType: "custom" },
  { name: "xAI (Grok)", url: "https://status.x.ai/", category: "AI/ML", statusPageType: "custom" },
  { name: "Kimi (Moonshot)", url: "https://status.moonshot.cn/api/v2/status.json", category: "AI/ML" },
  { name: "Together AI", url: "https://status.together.ai/", category: "AI/ML", statusPageType: "custom" },
  { name: "Manus", url: "https://status.manus.im/api/v2/status.json", category: "AI/ML" },
  { name: "OpenRouter", url: "https://status.openrouter.ai/", category: "AI/ML", statusPageType: "onlineornot" },
];

// ============================================================================
// CLOUD PROVIDERS
// ============================================================================
const cloudProviders: WebsiteEntry[] = [
  { name: "Vercel", url: `https://www.vercel-status.com/${base_url_atlassian}`, category: "Cloud Provider" },
  { name: "Netlify", url: `https://www.netlifystatus.com/${base_url_atlassian}`, category: "Cloud Provider" },
  { name: "Render", url: `https://status.render.com/${base_url_atlassian}`, category: "Cloud Provider" },
  { name: "Railway", url: "https://status.railway.com/", category: "Cloud Provider", statusPageType: "instatus" },
  { name: "Heroku", url: `https://status.heroku.com/${base_url_atlassian}`, category: "Cloud Provider", statusPageType: "custom" },
  { name: "Digital Ocean", url: "https://status.digitalocean.com/", category: "Cloud Provider", statusPageType: "atlassian" },
  { name: "Linode", url: `https://status.linode.com/${base_url_atlassian}`, category: "Cloud Provider" },
  { name: "AWS", url: "https://health.aws.amazon.com/health/status", category: "Cloud Provider", statusPageType: "custom" },
  { name: "Fly.io", url: "https://status.fly.io/", category: "Cloud Provider", statusPageType: "custom" },
  { name: "Deno Deploy", url: "https://status.deno.com/", category: "Cloud Provider", statusPageType: "custom" },
  { name: "Hostinger", url: "https://statuspage.hostinger.com/api/v2/status.json", category: "Hosting" },
  { name: "GoDaddy", url: "https://status.godaddy.com/", category: "Hosting", statusPageType: "atlassian" },
  // Google Cloud Services
  { name: "Google Cloud Platform", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "Cloud Compute", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "BigQuery", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "Cloud Storage", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "Cloud SQL", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "Kubernetes Engine", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "Cloud Functions", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "Cloud Run", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "Vertex AI", url: "https://status.cloud.google.com/", category: "Cloud Provider", statusPageType: "google" },
  { name: "Firebase", url: "https://status.firebase.google.com/", category: "Cloud Provider", statusPageType: "google" },
];

// ============================================================================
// DATABASES
// ============================================================================
const databases: WebsiteEntry[] = [
  { name: "Supabase", url: `https://status.supabase.com/${base_url_atlassian}`, category: "Database" },
  { name: "Turso", url: "https://status.turso.tech/", category: "Database", statusPageType: "betterstack" },
  { name: "SurrealDB", url: "https://status.surrealdb.com/", category: "Database", statusPageType: "betterstack" },
  { name: "PlanetScale", url: "https://www.planetscalestatus.com/", category: "Database", statusPageType: "incidentio" },
  { name: "Neon", url: "https://neonstatus.com/", category: "Database", statusPageType: "custom" },
  { name: "Upstash", url: "https://status.upstash.com/", category: "Database", statusPageType: "atlassian" },
  { name: "MongoDB Atlas", url: `https://status.mongodb.com/api/v2/status.json`, category: "Database" },
];

// ============================================================================
// CDNS
// ============================================================================
const cdns: WebsiteEntry[] = [
  { name: "Cloudflare", url: `https://www.cloudflarestatus.com/${base_url_atlassian}`, category: "CDN" },
  { name: "Fastly", url: "https://www.fastlystatus.com/", category: "CDN", statusPageType: "custom" },
  { name: "KeyCDN", url: "https://status.keycdn.com/", category: "CDN", statusPageType: "custom" },
];

// ============================================================================
// VERSION CONTROL
// ============================================================================
const versionControl: WebsiteEntry[] = [
  { name: "GitHub", url: `https://www.githubstatus.com/${base_url_atlassian}`, category: "Version Control" },
  { name: "GitLab", url: `https://status.gitlab.com/${base_url_atlassian}`, category: "Version Control", statusPageType: "custom" },
  { name: "Bitbucket", url: `https://bitbucket.status.atlassian.com/${base_url_atlassian}`, category: "Version Control" },
];

// ============================================================================
// CI / CD
// ============================================================================
const ciCD: WebsiteEntry[] = [
  { name: "CircleCI", url: `https://status.circleci.com/${base_url_atlassian}`, category: "CI/CD" },
  { name: "Travis CI", url: `https://www.traviscistatus.com/${base_url_atlassian}`, category: "CI/CD" },
  { name: "Jenkins", url: "https://status.jenkins.io/", category: "CI/CD", statusPageType: "custom" },
  { name: "HashiCorp", url: "https://status.hashicorp.com/", category: "Infrastructure", statusPageType: "incidentio" },
];

// ============================================================================
// DEVELOPMENT TOOLS
// ============================================================================
const developmentTools: WebsiteEntry[] = [
  { name: "npm", url: `https://status.npmjs.org/${base_url_atlassian}`, category: "Package Manager" },
  { name: "RubyGems", url: "https://status.rubygems.org/api/v2/status.json", category: "Package Manager" },
  { name: "Docker Hub", url: "https://www.dockerstatus.com/", category: "Container Registry", statusPageType: "statusio" },
  { name: "JetBrains", url: `https://status.jetbrains.com/${base_url_atlassian}`, category: "Development Tools", statusPageType: "custom" },
  { name: "Replit", url: "https://status.replit.com/", category: "Development Tools", statusPageType: "custom" },
  { name: "CodeSandbox", url: "https://status.codesandbox.io/", category: "Development Tools", statusPageType: "custom" },
  { name: "StackBlitz", url: "https://status.stackblitz.com/", category: "Development Tools", statusPageType: "custom" },
  { name: "Lovable", url: "https://status.lovable.dev/", category: "Development Tools", statusPageType: "custom" },
  { name: "Apple Developer", url: "https://developer.apple.com/system-status/", category: "Developer Platform", statusPageType: "apple" },
  { name: "Firecrawl", url: "https://status.firecrawl.dev/", category: "Developer Platform", statusPageType: "betterstack" },
  { name: "Polar", url: "https://status.polar.sh/", category: "Developer Platform", statusPageType: "betterstack" },
  { name: "Expo", url: "https://status.expo.dev/", category: "Developer Platform", statusPageType: "atlassian" },
  { name: "Mintlify", url: "https://status.mintlify.com/", category: "Developer Platform", statusPageType: "incidentio" },
  { name: "Runway", url: "https://status.runway.team/", category: "Developer Platform", statusPageType: "betterstack" },
  { name: "Raycast", url: "https://status.raycast.com/", category: "Developer Tools", statusPageType: "betterstack" },
  { name: "Warp", url: "https://status.warp.dev/api/v2/status.json", category: "Developer Tools" },
  { name: "Midday", url: "https://status.midday.ai/", category: "Productivity", statusPageType: "openstatus" },
  { name: "n8n", url: "https://status.n8n.cloud/", category: "Automation", statusPageType: "custom" },
];

// ============================================================================
// DESIGN TOOLS
// ============================================================================
const designTools: WebsiteEntry[] = [
  { name: "Figma", url: `https://status.figma.com/api/v2/status.json`, category: "Design" },
  { name: "Framer", url: "https://www.framerstatus.com/", category: "Design", statusPageType: "betterstack" },
  { name: "Canva", url: `https://www.canvastatus.com/api/v2/status.json`, category: "Design" },
  { name: "InVision", url: "https://status.invisionapp.com/", category: "Design", statusPageType: "custom" },
  { name: "Adobe", url: "https://status.adobe.com/", category: "Design", statusPageType: "custom" },
  { name: "Blender", url: "https://status.blender.org/status/public", category: "Design", statusPageType: "uptimekuma" },
];

// ============================================================================
// PRODUCTIVITY
// ============================================================================
const productivity: WebsiteEntry[] = [
  { name: "Notion", url: "https://www.notion-status.com/api/v2/status.json", category: "Productivity" },
  { name: "Todoist", url: "https://status.todoist.net/", category: "Productivity", statusPageType: "instatus" },
  { name: "Miro", url: `https://status.miro.com/${base_url_atlassian}`, category: "Productivity" },
  { name: "Airtable", url: `https://status.airtable.com/${base_url_atlassian}`, category: "Productivity" },
  { name: "Coda", url: `https://status.coda.io/api/v2/status.json`, category: "Productivity" },
  { name: "Udemy", url: "https://status.udemy.com/", category: "Productivity", statusPageType: "atlassian" },
  // Google Workspace
  { name: "Google Workspace", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Gmail", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Google Drive", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Google Meet", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Google Calendar", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Google Docs", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Google Sheets", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Google Slides", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Google Chat", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Gemini", url: "https://www.google.com/appsstatus/dashboard/", category: "Productivity", statusPageType: "google" },
  { name: "Calendly", url: "https://www.calendlystatus.com/api/v2/status.json", category: "Productivity" },
  { name: "Salesforce", url: "https://status.salesforce.com/", category: "Productivity", statusPageType: "salesforce" },
];

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================
const projectManagement: WebsiteEntry[] = [
  { name: "Linear", url: "https://linearstatus.com/", category: "Project Management", statusPageType: "incidentio" },
  { name: "Jira", url: `https://jira-software.status.atlassian.com/${base_url_atlassian}`, category: "Project Management" },
  { name: "Trello", url: `https://trello.status.atlassian.com/${base_url_atlassian}`, category: "Project Management" },
  { name: "Asana", url: `https://status.asana.com/${base_url_atlassian}`, category: "Project Management" },
];

// ============================================================================
// COMMUNICATION
// ============================================================================
const communication: WebsiteEntry[] = [
  { name: "Discord", url: `https://discordstatus.com/api/v2/status.json`, category: "Communication" },
  { name: "Slack", url: "https://slack-status.com/", category: "Communication", statusPageType: "custom" },
  { name: "Zoom", url: "https://www.zoomstatus.com/api/v2/status.json", category: "Communication" },
  { name: "Telegram", url: "https://status.telegram.org/", category: "Communication", statusPageType: "custom" },
];

// ============================================================================
// MICROSOFT SERVICES
// ============================================================================
const microsoftServices: WebsiteEntry[] = [
  { name: "Microsoft 365", url: "https://status.cloud.microsoft/m365/", category: "Productivity", statusPageType: "microsoft" },
  { name: "Microsoft Copilot", url: "https://status.cloud.microsoft/m365/", category: "Microsoft", statusPageType: "microsoft" },
  { name: "Microsoft Office", url: "https://status.cloud.microsoft/m365/", category: "Microsoft", statusPageType: "microsoft" },
  { name: "Microsoft OneDrive", url: "https://status.cloud.microsoft/m365/", category: "Microsoft", statusPageType: "microsoft" },
  { name: "Microsoft Outlook", url: "https://status.cloud.microsoft/m365/", category: "Microsoft", statusPageType: "microsoft" },
  { name: "Microsoft Teams", url: "https://status.cloud.microsoft/m365/", category: "Microsoft", statusPageType: "microsoft" },
];

// ============================================================================
// META SERVICES
// ============================================================================
const metaServices: WebsiteEntry[] = [
  { name: "Meta", url: "https://metastatus.com/", category: "Social", statusPageType: "custom" },
  { name: "Facebook", url: "https://metastatus.com/", category: "Meta", statusPageType: "custom" },
  { name: "Instagram", url: "https://metastatus.com/", category: "Meta", statusPageType: "custom" },
  { name: "WhatsApp", url: "https://metastatus.com/", category: "Meta", statusPageType: "custom" },
  { name: "Threads", url: "https://metastatus.com/", category: "Meta", statusPageType: "custom" },
  { name: "Messenger", url: "https://metastatus.com/", category: "Meta", statusPageType: "custom" },
];

// ============================================================================
// SOCIAL PLATFORMS
// ============================================================================
const socialPlatforms: WebsiteEntry[] = [
  { name: "Reddit", url: `https://www.redditstatus.com/${base_url_atlassian}`, category: "Social" },
  { name: "LinkedIn", url: `https://www.linkedin-status.com/${base_url_atlassian}`, category: "Social" },
  { name: "Pinterest", url: `https://www.pintereststatus.com/api/v2/status.json`, category: "Social" },
  { name: "Bluesky", url: "https://status.bsky.app/", category: "Social", statusPageType: "custom" },
  { name: "Mastodon", url: "https://status.mastodon.social/", category: "Social", statusPageType: "instatus" },
  { name: "DEV Community", url: "https://status.dev.to/", category: "Social", statusPageType: "atlassian" },
  { name: "VSCO", url: "https://status.workspace.vsco.co/api/v2/status.json", category: "Social" },
  { name: "Beacons", url: "https://status.beacons.ai/", category: "Social", statusPageType: "custom" },
  { name: "TikTok", url: "https://business-api.tiktok.com/marketing_api/api/status_page/incident", category: "Social", statusPageType: "incidentio" },
];

// ============================================================================
// MONITORING & ANALYTICS
// ============================================================================
const monitoring: WebsiteEntry[] = [
  { name: "DataDog", url: `https://status.datadoghq.com/${base_url_atlassian}`, category: "Monitoring" },
  { name: "New Relic", url: `https://status.newrelic.com/api/v2/status.json`, category: "Monitoring" },
  { name: "Sentry", url: `https://status.sentry.io/api/v2/status.json`, category: "Monitoring" },
  { name: "LogRocket", url: `https://status.logrocket.com/api/v2/status.json`, category: "Monitoring" },
  { name: "Grafana", url: `https://status.grafana.com/${base_url_atlassian}`, category: "Monitoring" },
  { name: "Google Analytics", url: "https://www.google.com/appsstatus/dashboard/", category: "Analytics", statusPageType: "google" },
  { name: "Mixpanel", url: `https://www.mixpanelstatus.com/api/v2/status.json`, category: "Analytics" },
  { name: "Amplitude", url: `https://status.amplitude.com/api/v2/status.json`, category: "Analytics" },
  { name: "PostHog", url: "https://www.posthogstatus.com/", category: "Analytics", statusPageType: "incidentio" },
];

// ============================================================================
// AUTHENTICATION & SECURITY
// ============================================================================
const authSecurity: WebsiteEntry[] = [
  { name: "Auth0", url: "https://status.auth0.com/", category: "Authentication", statusPageType: "custom" },
  { name: "Clerk", url: "https://status.clerk.com/", category: "Authentication", statusPageType: "incidentio" },
  { name: "Okta", url: "https://status.okta.com/", category: "Authentication", statusPageType: "custom" },
  { name: "1Password", url: `https://status.1password.com/api/v2/status.json`, category: "Security" },
  { name: "Bitwarden", url: "https://status.bitwarden.com/", category: "Security", statusPageType: "custom" },
];

// ============================================================================
// CONTENT & CMS
// ============================================================================
const contentCMS: WebsiteEntry[] = [
  { name: "Cloudinary", url: "https://status.cloudinary.com/", category: "Media", statusPageType: "atlassian" },
  { name: "Sanity", url: `https://www.sanity-status.com/api/v2/status.json`, category: "CMS" },
  { name: "Contentful", url: `https://www.contentfulstatus.com/${base_url_atlassian}`, category: "CMS" },
  { name: "Strapi", url: "https://status.strapi.io/", category: "CMS", statusPageType: "instatus" },
];

// ============================================================================
// E-COMMERCE & PAYMENTS
// ============================================================================
const ecommercePayments: WebsiteEntry[] = [
  // Brazilian
  { name: "Lojaintegrada", url: "https://status.lojaintegrada.com.br/api/v2/status.json", category: "E-commerce" },
  { name: "Nuvemshop", url: "https://status.nuvemshop.com.br/api/v2/status.json", category: "E-commerce" },
  { name: "Tray", url: `https://status.tray.com.br/api/v2/status.json`, category: "E-commerce" },
  { name: "Yampi", url: `https://status.yampi.com.br/api/v2/status.json`, category: "E-commerce" },
  { name: "Hotmart", url: "https://status.hotmart.com/en", category: "E-commerce", statusPageType: "hotmart" },
  { name: "Pagar.me", url: `https://status.pagar.me/api/v2/status.json`, category: "Payment" },
  { name: "AppMax", url: "https://status.appmax.com.br/api/getEventFeed/4ARzFvD1hF", category: "Payment", statusPageType: "appmax" },
  { name: "Wake", url: "https://status.fbits.net/api/v2/status.json", category: "E-commerce" },
  { name: "AbacatePay", url: "https://stats.uptimerobot.com/Gh0CMGVJN3/", category: "Payment", statusPageType: "custom" },
  { name: "Dodo Payments", url: "https://status.dodopayments.com/", category: "Payment", statusPageType: "betterstack" },
  { name: "Lemon Squeezy", url: "https://status.lemonsqueezy.com/", category: "Payment", statusPageType: "ohdear" },
  // International
  { name: "Stripe", url: "https://status.stripe.com/", category: "Payment", statusPageType: "stripe" },
  { name: "Shopify", url: "https://www.shopifystatus.com/", category: "E-commerce", statusPageType: "custom" },
  { name: "VTEX", url: "https://status.vtex.com/", category: "E-commerce", statusPageType: "incidentio" },
  { name: "PayPal", url: "https://www.paypal-status.com/", category: "Payment", statusPageType: "paypal" },
];

// ============================================================================
// EMAIL
// ============================================================================
const email: WebsiteEntry[] = [
  { name: "SendGrid", url: `https://status.sendgrid.com/${base_url_atlassian}`, category: "Email" },
  { name: "Mailgun", url: `https://status.mailgun.com/${base_url_atlassian}`, category: "Email" },
  { name: "Resend", url: "https://resend-status.com/", category: "Email", statusPageType: "custom" },
  { name: "Postmark", url: "https://status.postmarkapp.com/api/v1/status", category: "Email", statusPageType: "postmark" },
];

// ============================================================================
// SEARCH
// ============================================================================
const search: WebsiteEntry[] = [
  { name: "Algolia", url: `https://status.algolia.com/api/v2/status.json`, category: "Search" },
  { name: "Elasticsearch", url: `https://status.elastic.co/${base_url_atlassian}`, category: "Search" },
];

// ============================================================================
// REAL-TIME & COMMUNICATION API
// ============================================================================
const realtimeAPI: WebsiteEntry[] = [
  { name: "Pusher", url: `https://status.pusher.com/${base_url_atlassian}`, category: "Real-time" },
  { name: "Ably", url: `https://ably-realtime.statuspage.io/api/v2/status.json`, category: "Real-time" },
  { name: "Twilio", url: `https://status.twilio.com/${base_url_atlassian}`, category: "Communication API" },
];

// ============================================================================
// GAMING & STREAMING
// ============================================================================
const gamingStreaming: WebsiteEntry[] = [
  { name: "Unity", url: "https://status.unity.com/", category: "Game Development", statusPageType: "custom" },
  { name: "Twitch", url: "https://status.twitch.com/", category: "Streaming", statusPageType: "atlassian" },
  { name: "Kick", url: "https://status.kick.com/", category: "Streaming", statusPageType: "pagerduty" },
  { name: "Steam", url: "https://steamstat.us/", category: "Gaming", statusPageType: "custom" },
  { name: "Roblox", url: "https://status.roblox.com/", category: "Gaming", statusPageType: "custom" },
  { name: "Nvidia GeForce Now", url: `https://status.geforcenow.com/${base_url_atlassian}`, category: "Gaming" },
  { name: "Xbox", url: "https://support.xbox.com/en-US/xbox-live-status", category: "Gaming", statusPageType: "xbox" },
  { name: "PlayStation", url: "https://status.playstation.com/en-us/", category: "Gaming", statusPageType: "playstation" },
];

// ============================================================================
// TESTING
// ============================================================================
const testing: WebsiteEntry[] = [
  { name: "BrowserStack", url: `https://status.browserstack.com/${base_url_atlassian}`, category: "Testing" },
  { name: "Sauce Labs", url: `https://status.saucelabs.com/${base_url_atlassian}`, category: "Testing" },
];

// ============================================================================
// GOVERNMENT
// ============================================================================
const government: WebsiteEntry[] = [
  { name: "SEFAZ - Nota Fiscal Eletrônica", url: "https://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx?AspxAutoDetectCookieSupport=1", category: "Government", statusPageType: "custom" },
];

// ============================================================================
// MERGE ALL CATEGORIES
// ============================================================================
export const websites: WebsiteEntry[] = [
  ...aiCodeEditors,
  ...aiMLServices,
  ...cloudProviders,
  ...databases,
  ...cdns,
  ...versionControl,
  ...ciCD,
  ...developmentTools,
  ...designTools,
  ...productivity,
  ...projectManagement,
  ...communication,
  ...microsoftServices,
  ...metaServices,
  ...socialPlatforms,
  ...monitoring,
  ...authSecurity,
  ...contentCMS,
  ...ecommercePayments,
  ...email,
  ...search,
  ...realtimeAPI,
  ...gamingStreaming,
  ...testing,
  ...government,

  // Suggested by community
  {
    name: "Unosend",
    url: "https://status.unosend.co/",
    category: "Email",
  },
];

// Adiciona statusPageType="custom" para todos os domínios na lista de externos
// que não foram explicitamente marcados
websites.forEach((website) => {
  if (!website.statusPageType) {
    const domain = new URL(website.url).hostname;
    if (externalStatusDomains.some((extDomain) => domain.includes(extDomain))) {
      website.statusPageType = "custom";
    }
  }
});
