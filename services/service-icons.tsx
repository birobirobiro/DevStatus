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
  Facebook,
  BrainCircuit,
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
  Docker: Cloud,
  "Docker Hub": Cloud,
  NPM: Package,
  PNPM: Package,
  Yarn: Package,
  PyPI: Package,
  "VS Code": Code,
  VSCode: Code,
  Figma: Palette,
  Discord: MessageSquare,
  Slack: MessageSquare,
  "Hugging Face": Bot,
  HuggingFace: Bot,

  // Analytics & Monitoring
  "Google Analytics": BarChart3,
  Analytics: BarChart3,
  "New Relic": BarChart3,
  NewRelic: BarChart3,
  Sentry: Shield,
  LogRocket: Activity,
  LogDNA: Activity,
  Datadog: BarChart3,

  // Media & Assets
  Cloudinary: ImageIcon,
  Uploadcare: ImageIcon,
  Imgix: ImageIcon,
  "AWS S3": Cloud,

  // Payments & Commerce
  Stripe: CreditCard,
  PayPal: CreditCard,
  "Square Up": CreditCard,
  Square: CreditCard,

  // Email & Communication
  SendGrid: Mail,
  "Send Grid": Mail,
  Mailgun: Mail,
  "Mail Gun": Mail,
  Postmark: Mail,
  "Post Mark": Mail,

  // Authentication & Security
  Auth0: Lock,
  "Auth 0": Lock,
  Okta: Lock,
  "Magic Link": Lock,
  MagicLink: Lock,
  Clerk: Lock,

  // Search
  Algolia: Search,
  Meilisearch: Search,
  "Meili Search": Search,
  Elasticsearch: Search,
  "Elastic Search": Search,

  // CMS & Content
  Contentful: FileText,
  "Content Stack": FileText,
  ContentStack: FileText,
  Strapi: FileText,
  Sanity: FileText,

  // Social & Community
  Facebook: Facebook,
  Twitter: MessageSquare,
  Instagram: ImageIcon,
  LinkedIn: Users,
  "Linked In": Users,

  // Gaming & Entertainment
  Twitch: Gamepad2,
  YouTube: Video,
  "You Tube": Video,

  // Mobile & Apps
  "Apple App Store": Smartphone,
  "Google Play": Smartphone,
  "Play Store": Smartphone,

  // Web Hosting & DNS
  "Google Domains": Globe,
  Namecheap: Globe,
  GoDaddy: Globe,
  "Name Cheap": Globe,
  "Go Daddy": Globe,

  // IDEs & Tools
  WebStorm: Code,
  "Web Storm": Code,
  IntelliJ: Code,
  "Intellij IDEA": Code,
  PyCharm: Code,
  "Py Charm": Code,
  PhpStorm: Code,
  "Php Storm": Code,
  "Android Studio": Code,

  // Business & Productivity
  Notion: FileText,
  Jira: Settings,
  Confluence: FileText,
  Trello: Settings,
  Asana: Settings,
  "Microsoft 365": Settings,
  "Office 365": Settings,

  // Testing & QA
  Jest: TestTube,
  Cypress: TestTube,
  Selenium: TestTube,
  TestCafe: TestTube,
  "Test Cafe": TestTube,

  // Desktop & OS
  Windows: Monitor,
  macOS: Monitor,
  Linux: Monitor,
  Ubuntu: Monitor,

  // Monitoring & Error Tracking
  Splunk: Eye,
  Grafana: BarChart3,
  Prometheus: BarChart3,

  // Audio & Media
  Spotify: Headphones,
  "Apple Music": Headphones,
  Pandora: Headphones,

  // E-commerce
  Shopify: ShoppingCart,
  WooCommerce: ShoppingCart,
  "Woo Commerce": ShoppingCart,
  Magento: ShoppingCart,

  // Infrastructure
  Kubernetes: Server,
  "Digital Ocean App Platform": Cloud,
  "DigitalOcean App Platform": Cloud,

  // Machine Learning
  TensorFlow: BrainCircuit,
  PyTorch: BrainCircuit,
  "Py Torch": BrainCircuit,

  // IoT & Hardware
  Arduino: Server,
  "Raspberry Pi": Server,
  RaspberryPi: Server,

  // Radio & Broadcasting
  "Internet Radio": Radio,
  Podcast: Radio,
  "Live Stream": Video,
  LiveStream: Video,

  // Data Visualization
  "Power BI": PieChart,
  PowerBI: PieChart,
  Tableau: PieChart,
  Looker: PieChart,
}

export function getServiceIcon(serviceName: string) {
  const normalizedName = serviceName.trim()
  return serviceIconMap[normalizedName] || Globe
}
