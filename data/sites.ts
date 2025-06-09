export const base_url_atlassian = "api/v2/summary.json"

// Lista de domínios que usam status pages próprias ou de terceiros
// mas não fornecem API compatível com Atlassian
const externalStatusDomains = [
  "fastlystatus.com",
  "status.strapi.io",
  "status.stripe.com",
  "replicatestatus.com",
  "status.okta.com",
  "status.postmarkapp.com",
  "status.jetbrains.com",
  "status.heroku.com",
  "status.gitlab.com",
  "status.auth0.com",
  "status.clerk.com",
]

export const websites = [
  // AI Code Editors
  {
    name: "Cursor",
    url: `https://status.cursor.com/${base_url_atlassian}`,
    category: "AI Code Editor",
  },
  {
    name: "Windsurf",
    url: `https://status.windsurf.com/${base_url_atlassian}`,
    category: "AI Code Editor",
  },

  // Cloud Providers & Infrastructure
  {
    name: "Vercel",
    url: `https://www.vercel-status.com/${base_url_atlassian}`,
    category: "Cloud Provider",
  },
  {
    name: "Netlify",
    url: `https://www.netlifystatus.com/${base_url_atlassian}`,
    category: "Cloud Provider",
  },
  {
    name: "Render",
    url: `https://status.render.com/${base_url_atlassian}`,
    category: "Cloud Provider",
  },
  {
    name: "Railway",
    url: "https://status.railway.com/",
    category: "Cloud Provider",
    statusPageType: "custom",
  },
  {
    name: "Heroku",
    url: `https://status.heroku.com/${base_url_atlassian}`,
    category: "Cloud Provider",
    statusPageType: "custom", // Marcado como custom pois está na lista de domínios externos
  },
  {
    name: "Digital Ocean",
    url: `https://status.digitalocean.com/${base_url_atlassian}`,
    category: "Cloud Provider",
  },
  {
    name: "Linode",
    url: `https://status.linode.com/${base_url_atlassian}`,
    category: "Cloud Provider",
  },
  {
    name: "AWS",
    url: "https://health.aws.amazon.com/health/status",
    category: "Cloud Provider",
    statusPageType: "custom",
  },
  {
    name: "Cloudflare",
    url: `https://www.cloudflarestatus.com/${base_url_atlassian}`,
    category: "CDN",
  },
  {
    name: "Fly.io",
    url: "https://status.fly.io/",
    category: "Cloud Provider",
    statusPageType: "custom",
  },
  {
    name: "Deno Deploy",
    url: "https://status.deno.com/",
    category: "Cloud Provider",
    statusPageType: "custom",
  },

  // Google Cloud Platform
  {
    name: "Google Cloud Platform",
    url: "https://status.cloud.google.com/",
    category: "Cloud Provider",
    statusPageType: "google",
  },
  {
    name: "Google Cloud - Compute Engine",
    url: "https://status.cloud.google.com/products/compute",
    category: "Google Cloud",
    statusPageType: "google",
  },
  {
    name: "Google Cloud - BigQuery",
    url: "https://status.cloud.google.com/products/bigquery",
    category: "Google Cloud",
    statusPageType: "google",
  },
  {
    name: "Google Cloud - Cloud Storage",
    url: "https://status.cloud.google.com/products/storage",
    category: "Google Cloud",
    statusPageType: "google",
  },
  {
    name: "Google Cloud - Cloud SQL",
    url: "https://status.cloud.google.com/products/sql",
    category: "Google Cloud",
    statusPageType: "google",
  },
  {
    name: "Google Cloud - Kubernetes Engine",
    url: "https://status.cloud.google.com/products/kubernetes-engine",
    category: "Google Cloud",
    statusPageType: "google",
  },
  {
    name: "Google Cloud - Cloud Functions",
    url: "https://status.cloud.google.com/products/functions",
    category: "Google Cloud",
    statusPageType: "google",
  },
  {
    name: "Google Cloud - Cloud Run",
    url: "https://status.cloud.google.com/products/run",
    category: "Google Cloud",
    statusPageType: "google",
  },
  {
    name: "Google Cloud - Vertex AI",
    url: "https://status.cloud.google.com/products/vertexai",
    category: "Google Cloud",
    statusPageType: "google",
  },

  // Google Workspace
  {
    name: "Google Workspace",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Productivity",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Gmail",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Google Drive",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Google Meet",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Google Calendar",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Google Docs",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Google Sheets",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Google Slides",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Google Chat",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },
  {
    name: "Google Workspace - Gemini",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Google Workspace",
    statusPageType: "google",
  },

  // Firebase
  {
    name: "Firebase",
    url: "https://status.firebase.google.com/",
    category: "Cloud Provider",
    statusPageType: "google",
  },

  // Databases
  {
    name: "Supabase",
    url: `https://status.supabase.com/${base_url_atlassian}`,
    category: "Database",
  },
  {
    name: "PlanetScale",
    url: `https://www.planetscalestatus.com/${base_url_atlassian}`,
    category: "Database",
  },
  {
    name: "Neon",
    url: `https://neonstatus.com/${base_url_atlassian}`,
    category: "Database",
  },
  {
    name: "Upstash",
    url: `https://status.upstash.com/${base_url_atlassian}`,
    category: "Database",
  },
  {
    name: "MongoDB Atlas",
    url: `https://status.mongodb.com/api/v2/status.json`,
    category: "Database",
  },

  // Developer Platforms
  {
    name: "Apple Developer",
    url: "https://developer.apple.com/system-status/",
    category: "Developer Platform",
    statusPageType: "apple",
  },

  // Version Control & CI/CD
  {
    name: "GitHub",
    url: `https://www.githubstatus.com/${base_url_atlassian}`,
    category: "Version Control",
  },
  {
    name: "GitLab",
    url: `https://status.gitlab.com/${base_url_atlassian}`,
    category: "Version Control",
    statusPageType: "custom", // Marcado como custom pois está na lista de domínios externos
  },
  {
    name: "Bitbucket",
    url: `https://bitbucket.status.atlassian.com/${base_url_atlassian}`,
    category: "Version Control",
  },
  {
    name: "CircleCI",
    url: `https://status.circleci.com/${base_url_atlassian}`,
    category: "CI/CD",
  },
  {
    name: "Travis CI",
    url: `https://www.traviscistatus.com/${base_url_atlassian}`,
    category: "CI/CD",
  },
  {
    name: "Jenkins",
    url: "https://status.jenkins.io/",
    category: "CI/CD",
    statusPageType: "custom",
  },

  // Development Tools
  {
    name: "npm",
    url: `https://status.npmjs.org/${base_url_atlassian}`,
    category: "Package Manager",
  },
  {
    name: "Docker Hub",
    url: "https://www.dockerstatus.com/",
    category: "Container Registry",
    statusPageType: "custom",
  },
  {
    name: "JetBrains",
    url: `https://status.jetbrains.com/${base_url_atlassian}`,
    category: "Development Tools",
    statusPageType: "custom", // Marcado como custom pois está na lista de domínios externos
  },
  {
    name: "Replit",
    url: "https://status.replit.com/",
    category: "Development Tools",
    statusPageType: "custom",
  },
  {
    name: "CodeSandbox",
    url: "https://status.codesandbox.io/",
    category: "Development Tools",
    statusPageType: "custom",
  },
  {
    name: "StackBlitz",
    url: "https://status.stackblitz.com/",
    category: "Development Tools",
    statusPageType: "custom",
  },

  // Design & Collaboration
  {
    name: "Figma",
    url: `https://status.figma.com/api/v2/status.json`,
    category: "Design",
  },
  {
    name: "Notion",
    url: "https://www.notion-status.com/api/v2/status.json",
    category: "Productivity",
  },
  {
    name: "Miro",
    url: `https://status.miro.com/${base_url_atlassian}`,
    category: "Productivity",
  },
  {
    name: "Linear",
    url: `https://linearstatus.com/${base_url_atlassian}`,
    category: "Project Management",
  },
  {
    name: "Jira",
    url: `https://jira-software.status.atlassian.com/${base_url_atlassian}`,
    category: "Project Management",
  },
  {
    name: "Trello",
    url: `https://trello.status.atlassian.com/${base_url_atlassian}`,
    category: "Project Management",
  },
  {
    name: "Asana",
    url: `https://status.asana.com/${base_url_atlassian}`,
    category: "Project Management",
  },

  // Communication
  {
    name: "Discord",
    url: `https://discordstatus.com/api/v2/status.json`,
    category: "Communication",
  },
  {
    name: "Slack",
    url: "https://slack-status.com/",
    category: "Communication",
    statusPageType: "custom",
  },
  {
    name: "Zoom",
    url: `https://status.zoom.us/${base_url_atlassian}`,
    category: "Communication",
  },
  {
    name: "Microsoft Teams",
    url: "https://portal.office.com/servicestatus",
    category: "Communication",
    statusPageType: "custom",
  },
  {
    name: "Telegram",
    url: "https://status.telegram.org/",
    category: "Communication",
    statusPageType: "custom",
  },

  // Meta Services
  {
    name: "Meta",
    url: "https://metastatus.com/",
    category: "Social",
    statusPageType: "custom",
  },
  {
    name: "Meta - Facebook",
    url: "https://metastatus.com/",
    category: "Meta",
    statusPageType: "custom",
  },
  {
    name: "Meta - Instagram",
    url: "https://metastatus.com/",
    category: "Meta",
    statusPageType: "custom",
  },
  {
    name: "Meta - WhatsApp",
    url: "https://metastatus.com/",
    category: "Meta",
    statusPageType: "custom",
  },
  {
    name: "Meta - Threads",
    url: "https://metastatus.com/",
    category: "Meta",
    statusPageType: "custom",
  },
  {
    name: "Meta - Messenger",
    url: "https://metastatus.com/",
    category: "Meta",
    statusPageType: "custom",
  },

  // AI & ML Services
  {
    name: "OpenAI",
    url: `https://status.openai.com/${base_url_atlassian}`,
    category: "AI/ML",
  },
  {
    name: "Anthropic",
    url: `https://status.anthropic.com/${base_url_atlassian}`,
    category: "AI/ML",
  },
  {
    name: "Replicate",
    url: `https://status.replicate.com/${base_url_atlassian}`,
    category: "AI/ML",
    statusPageType: "custom", // Marcado como custom pois está na lista de domínios externos
  },
  {
    name: "Hugging Face",
    url: "https://status.huggingface.co/",
    category: "AI/ML",
    statusPageType: "custom",
  },
  {
    name: "Midjourney",
    url: "https://status.midjourney.com/",
    category: "AI/ML",
    statusPageType: "custom",
  },
  {
    name: "Stability AI",
    url: "https://status.stability.ai/",
    category: "AI/ML",
    statusPageType: "custom",
  },
  {
    name: "Cohere",
    url: "https://status.cohere.ai/",
    category: "AI/ML",
    statusPageType: "custom",
  },

  // Monitoring & Analytics
  {
    name: "DataDog",
    url: `https://status.datadoghq.com/${base_url_atlassian}`,
    category: "Monitoring",
  },
  {
    name: "New Relic",
    url: `https://status.newrelic.com/api/v2/status.json`,
    category: "Monitoring",
  },
  {
    name: "Sentry",
    url: `https://status.sentry.io/api/v2/status.json`,
    category: "Monitoring",
  },
  {
    name: "LogRocket",
    url: `https://status.logrocket.com/api/v2/status.json`,
    category: "Monitoring",
  },
  {
    name: "Grafana",
    url: `https://status.grafana.com/${base_url_atlassian}`,
    category: "Monitoring",
  },

  // Authentication & Security
  {
    name: "Auth0",
    url: `https://status.auth0.com/api/v2/status.json`,
    category: "Authentication",
  },
  {
    name: "Clerk",
    url: `https://status.clerk.com/${base_url_atlassian}`,
    category: "Authentication",
    statusPageType: "custom", // Marcado como custom pois está na lista de domínios externos
  },
  {
    name: "Okta",
    url: `https://status.okta.com/api/v2/status.json`,
    category: "Authentication",
  },
  {
    name: "1Password",
    url: `https://status.1password.com/api/v2/status.json`,
    category: "Security",
  },
  {
    name: "Bitwarden",
    url: "https://status.bitwarden.com/",
    category: "Security",
    statusPageType: "custom",
  },

  // Content & Media
  {
    name: "Cloudinary",
    url: `https://status.cloudinary.com/${base_url_atlassian}`,
    category: "Media",
  },
  {
    name: "Sanity",
    url: `https://www.sanity-status.com/api/v2/status.json`,
    category: "CMS",
  },
  {
    name: "Contentful",
    url: `https://www.contentfulstatus.com/${base_url_atlassian}`,
    category: "CMS",
  },
  {
    name: "Strapi",
    url: `https://status.strapi.io/api/v2/status.json`,
    category: "CMS",
  },

  // Payment & E-commerce
  {
    name: "Stripe",
    url: `https://status.stripe.com/api/v2/status.json`,
    category: "Payment",
  },
  {
    name: "Shopify",
    url: "https://www.shopifystatus.com/",
    category: "E-commerce",
    statusPageType: "custom",
  },
  {
    name: "PayPal",
    url: "https://www.paypal-status.com/",
    category: "Payment",
    statusPageType: "custom",
  },
  {
    name: "Pagar.me",
    url: `https://status.pagar.me/api/v2/status.json`,
    category: "Payment",
  },

  // Email & Communication
  {
    name: "SendGrid",
    url: `https://status.sendgrid.com/${base_url_atlassian}`,
    category: "Email",
  },
  {
    name: "Mailgun",
    url: `https://status.mailgun.com/${base_url_atlassian}`,
    category: "Email",
  },
  {
    name: "Resend",
    url: "https://resend-status.com/",
    category: "Email",
    statusPageType: "custom",
  },
  {
    name: "Postmark",
    url: `https://status.postmarkapp.com/api/v2/status.json`,
    category: "Email",
  },

  // Search & Analytics
  {
    name: "Algolia",
    url: `https://status.algolia.com/api/v2/status.json`,
    category: "Search",
  },
  {
    name: "Elasticsearch",
    url: `https://status.elastic.co/${base_url_atlassian}`,
    category: "Search",
  },

  // Social & Community
  {
    name: "Reddit",
    url: `https://www.redditstatus.com/${base_url_atlassian}`,
    category: "Social",
  },
  {
    name: "LinkedIn",
    url: `https://www.linkedin-status.com/${base_url_atlassian}`,
    category: "Social",
  },
  {
    name: "Pinterest",
    url: `https://www.pintereststatus.com/api/v2/status.json`,
    category: "Social",
  },
  {
    name: "Bluesky",
    url: "https://status.bsky.app/",
    category: "Social",
    statusPageType: "custom",
  },
  {
    name: "Mastodon",
    url: "https://status.mastodon.social/",
    category: "Social",
    statusPageType: "custom",
  },

  // Gaming & Entertainment
  {
    name: "Unity",
    url: "https://status.unity.com/",
    category: "Game Development",
    statusPageType: "custom",
  },
  {
    name: "Twitch",
    url: `https://status.twitch.com/api/v2/status.json`,
    category: "Streaming",
  },
  {
    name: "Steam",
    url: "https://steamstat.us/",
    category: "Gaming",
    statusPageType: "custom",
  },

  // API & Backend Services
  {
    name: "Pusher",
    url: `https://status.pusher.com/${base_url_atlassian}`,
    category: "Real-time",
  },
  {
    name: "Ably",
    url: `https://ably-realtime.statuspage.io/api/v2/status.json`,
    category: "Real-time",
  },
  {
    name: "Twilio",
    url: `https://status.twilio.com/${base_url_atlassian}`,
    category: "Communication API",
  },

  // CDN & Performance
  {
    name: "Fastly",
    url: `https://status.fastly.com/api/v2/status.json`,
    category: "CDN",
  },
  {
    name: "KeyCDN",
    url: "https://status.keycdn.com/",
    category: "CDN",
    statusPageType: "custom",
  },

  // Analytics & Tracking
  {
    name: "Google Analytics",
    url: "https://www.google.com/appsstatus/dashboard/",
    category: "Analytics",
    statusPageType: "google",
  },
  {
    name: "Mixpanel",
    url: `https://www.mixpanelstatus.com/api/v2/status.json`,
    category: "Analytics",
  },
  {
    name: "Amplitude",
    url: `https://status.amplitude.com/api/v2/status.json`,
    category: "Analytics",
  },

  // Testing & QA
  {
    name: "BrowserStack",
    url: `https://status.browserstack.com/${base_url_atlassian}`,
    category: "Testing",
  },
  {
    name: "Sauce Labs",
    url: `https://status.saucelabs.com/${base_url_atlassian}`,
    category: "Testing",
  },

  // More Productivity
  {
    name: "Airtable",
    url: `https://status.airtable.com/${base_url_atlassian}`,
    category: "Productivity",
  },
  {
    name: "Coda",
    url: `https://status.coda.io/api/v2/status.json`,
    category: "Productivity",
  },

  // More Design Tools
  {
    name: "Canva",
    url: `https://www.canvastatus.com/api/v2/status.json`,
    category: "Design",
  },
  {
    name: "InVision",
    url: "https://status.invisionapp.com/",
    category: "Design",
    statusPageType: "custom",
  },
]

// Adiciona statusPageType="custom" para todos os domínios na lista de externos
// que não foram explicitamente marcados
websites.forEach((website) => {
  if (!website.statusPageType) {
    const domain = new URL(website.url).hostname
    if (externalStatusDomains.some((extDomain) => domain.includes(extDomain))) {
      website.statusPageType = "custom"
    }
  }
})
