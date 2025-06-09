export interface Component {
  id: string
  name: string
  status: string
}

export interface Page {
  id: string
  name: string
  url: string
  updated_at: string
}

export interface StatusInfo {
  description: string
  indicator: string
}

export interface WebsiteData {
  page: Page
  components: Component[]
  status: StatusInfo
  category: string
  url: string
  statusPageType?: string
  name: string
}

export interface LocalWebsiteEntry {
  name: string
  url: string
  category: string
  statusPageType?: string
}

// SVGL API Types
export type ThemeOptions = {
  dark: string
  light: string
}

export interface SVGLResponse {
  id?: number
  title: string
  category: string | string[]
  route: string | ThemeOptions
  wordmark?: string | ThemeOptions
  brandUrl?: string
  url: string
}

export interface SVGLCategory {
  category: string
  total: number
}
