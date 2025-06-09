import {
  Cloud,
  Database,
  GitBranch,
  Zap,
  Package,
  Palette,
  MessageSquare,
  Bot,
  BarChart3,
  Shield,
  ImageIcon,
  CreditCard,
  Mail,
  Search,
  Users,
  Gamepad2,
  Video,
  Smartphone,
  Globe,
  Server,
  Code,
  Settings,
  Activity,
  FileText,
  Briefcase,
  Monitor,
  Lock,
  Eye,
  Headphones,
  ShoppingCart,
  Wind,
  Train,
  TestTube,
  Radio,
  PieChart,
} from "lucide-react"

const serviceIconMap: Record<string, any> = {
  // AI Code Editors
  Cursor: Code,
  Windsurf: Wind,

  // Cloud Providers
  Vercel: Zap,
  Netlify: Globe,
  Render: Server,
  Railway: Train,
  Heroku: Cloud,
  "Digital Ocean": Cloud,
  DigitalOcean: Cloud,
  Linode: Server,
  "Google Cloud Platform": Cloud,
  "Google Cloud": Cloud,
  GCP: Cloud,
  AWS: Cloud,
  "Amazon Web Services": Cloud,
  Cloudflare: Shield,
  "Microsoft Azure": Cloud,
  Azure: Cloud,
  "Fly.io": Cloud,
  Fly: Cloud,
  "Deno Deploy": Code,
  Deno: Code,

  // Databases
  Supabase: Database,
  PlanetScale: Database,
  Neon: Database,
  Upstash: Database,
  "MongoDB Atlas": Database,
  MongoDB: Database,
  "Mongo DB": Database,
  Redis: Database,
  PostgreSQL: Database,
  MySQL: Database,
  Airtable: Database,
  "Air Table": Database,

  // Developer Platforms
  "Apple Developer": Smartphone,
  Apple: Smartphone,
  Firebase: Zap,
  "Google Firebase": Zap,

  // Version Control & CI/CD
  GitHub: GitBranch,
  "Git Hub": GitBranch,
  GitLab: GitBranch,
  "Git Lab": GitBranch,
  Bitbucket: GitBranch,
  "Bit Bucket": GitBranch,
  CircleCI: Zap,
  "Circle CI": Zap,
  "Travis CI": Zap,
  TravisCI: Zap,
  "GitHub Actions": GitBranch,
  Jenkins: Settings,

  // Development Tools
  npm: Package,
  NPM: Package,
  "Docker Hub": Package,
  Docker: Package,
  JetBrains: Code,
  "VS Code": Code,
  "Visual Studio Code": Code,
  VSCode: Code,
  Yarn: Package,
  pnpm: Package,
  PNPM: Package,
  Replit: Code,
  CodeSandbox: Code,
  "Code Sandbox": Code,
  StackBlitz: Code,
  "Stack Blitz": Code,

  // Design & Collaboration
  Figma: Palette,
  Notion: FileText,
  Miro: Palette,
  Linear: Briefcase,
  Jira: Briefcase,
  "Atlassian Jira": Briefcase,
  Trello: Briefcase,
  "Atlassian Trello": Briefcase,
  Asana: Briefcase,
  Sketch: Palette,
  "Adobe XD": Palette,
  "Adobe Creative Cloud": Palette,
  Canva: Palette,
  InVision: Palette,
  "In Vision": Palette,

  // Communication
  Discord: MessageSquare,
  Slack: MessageSquare,
  Zoom: Video,
  "Microsoft Teams": MessageSquare,
  Teams: MessageSquare,
  Telegram: MessageSquare,
  "WhatsApp Business": MessageSquare,
  WhatsApp: MessageSquare,

  // AI & ML Services
  OpenAI: Bot,
  "Open AI": Bot,
  Anthropic: Bot,
  Claude: Bot,
  "Claude AI": Bot,
  Replicate: Bot,
  "Hugging Face": Bot,
  HuggingFace: Bot,
  Midjourney: Bot,
  "Claude IA": Bot,
  ElevenLabs: Headphones,
  "Eleven Labs": Headphones,
  "Stability AI": Bot,
  Stability: Bot,
  Cohere: Bot,

  // Monitoring & Analytics
  DataDog: BarChart3,
  "Data Dog": BarChart3,
  Datadog: BarChart3,
  "New Relic": BarChart3,
  NewRelic: BarChart3,
  Sentry: Eye,
  LogRocket: Eye,
  "Log Rocket": Eye,
  Grafana: BarChart3,
  "Google Analytics": BarChart3,
  Analytics: BarChart3,

  // Authentication & Security
  Auth0: Shield,
  "Auth 0": Shield,
  Clerk: Shield,
  Okta: Lock,
  "1Password": Lock,
  "One Password": Lock,
  Bitwarden: Shield,
  "Bit Warden": Shield,

  // Content & Media
  Cloudinary: ImageIcon,
  Sanity: FileText,
  "Sanity.io": FileText,
  Contentful: FileText,
  Strapi: FileText,

  // Payment & E-commerce
  Stripe: CreditCard,
  Shopify: ShoppingCart,
  PayPal: CreditCard,
  "Pay Pal": CreditCard,

  // Email & Communication
  SendGrid: Mail,
  "Send Grid": Mail,
  Mailgun: Mail,
  "Mail Gun": Mail,
  Resend: Mail,
  Postmark: Mail,

  // Search & Analytics
  Algolia: Search,
  Elasticsearch: Search,
  "Elastic Search": Search,

  // Social & Community
  Reddit: Users,
  LinkedIn: Users,
  "Linked In": Users,
  Facebook: Users,
  Twitter: Users,
  X: Users,
  Bluesky: Users,
  Mastodon: Users,

  // Gaming & Entertainment
  Unity: Gamepad2,
  "Unity Technologies": Gamepad2,
  Twitch: Video,
  Steam: Gamepad2,

  // API & Backend Services
  Pusher: Radio,
  Ably: Radio,
  Twilio: MessageSquare,

  // CDN & Infrastructure
  Fastly: Globe,
  KeyCDN: Globe,
  "Key CDN": Globe,

  // Analytics & Tracking
  Mixpanel: PieChart,
  Amplitude: BarChart3,

  // Testing & QA
  BrowserStack: TestTube,
  "Sauce Labs": TestTube,

  // Remote Desktop
  AnyDesk: Monitor,
  "Any Desk": Monitor,
  "Team Viewer": Monitor,
  TeamViewer: Monitor,

  // Streaming & Media
  YouTube: Video,
  "You Tube": Video,
  Vimeo: Video,

  // Productivity
  "Monday.com": Briefcase,
  Monday: Briefcase,
  ClickUp: Briefcase,
  "Click Up": Briefcase,
  Coda: FileText,

  // Default fallback
  default: Activity,
}

export function getServiceIcon(serviceName: string) {
  const normalizedName = serviceName.trim()
  return serviceIconMap[normalizedName] || serviceIconMap["default"]
}
