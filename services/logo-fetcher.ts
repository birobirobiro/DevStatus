export interface LogoResult {
  url: string
  source: string
  lightUrl?: string
  darkUrl?: string
}

interface SVGLResponse {
  id: number
  title: string
  category: string | string[]
  route: string | { light: string; dark: string }
  url: string
  wordmark?: string | { light: string; dark: string }
  brandUrl?: string
}

export class LogoFetcher {
  private static cache = new Map<string, LogoResult | null>()
  private static failedCache = new Map<string, number>()
  private static lastRequestTime = 0
  private static readonly MIN_REQUEST_INTERVAL = 50 // Faster rate limiting
  private static readonly FAILED_CACHE_DURATION = 1000 * 60 * 60 // 1 hour for failed requests
  private static svglLogoList: { title: string; route: string | { light: string; dark: string } }[] | null = null
  private static svglListLoadedAt = 0
  private static readonly SVGL_LIST_CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

  // Only hardcode logos that are NOT available in SVGL or SimpleIcons
  private static readonly HARDCODED_LOGOS: Record<string, LogoResult> = {}

  private static async rateLimit(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime

    if (elapsed < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - elapsed))
    }

    this.lastRequestTime = Date.now()
  }

  private static async loadSVGLLogoList(): Promise<void> {
    if (this.svglLogoList && Date.now() - this.svglListLoadedAt < this.SVGL_LIST_CACHE_DURATION) {
      return
    }

    try {
      const response = await fetch('https://api.svgl.app/', {
        headers: { Accept: 'application/json' },
        cache: 'force-cache'
      })

      if (!response.ok) {
        return
      }

      const data = await response.json()
      this.svglLogoList = Array.isArray(data) ? data : data.logos || []
      this.svglListLoadedAt = Date.now()
    } catch {
      // Silently fail
    }
  }

  private static searchSVGLLocal(term: string): LogoResult | null {
    if (!this.svglLogoList || this.svglLogoList.length === 0) return null

    const termLower = term.toLowerCase()
    
    // First try exact match
    const exactMatch = this.svglLogoList.find(logo => 
      logo.title.toLowerCase() === termLower
    )

    if (exactMatch) {
      const route = exactMatch.route
      const lightUrl = typeof route === 'object' ? route.light : route
      const darkUrl = typeof route === 'object' ? route.dark : route
      
      if (!lightUrl && !darkUrl) return null

      return { 
        url: darkUrl || lightUrl || '', 
        source: 'svgl',
        lightUrl,
        darkUrl
      }
    }

    // Try startsWith (more strict than includes)
    const startsWithMatch = this.svglLogoList.find(logo =>
      logo.title.toLowerCase().startsWith(termLower)
    )

    if (!startsWithMatch) return null

    const route = startsWithMatch.route
    const lightUrl = typeof route === 'object' ? route.light : route
    const darkUrl = typeof route === 'object' ? route.dark : route

    if (!lightUrl && !darkUrl) return null

    return { 
      url: darkUrl || lightUrl || '', 
      source: 'svgl',
      lightUrl,
      darkUrl
    }
  }

  private static getSearchTerms(serviceName: string): string[] {
    const name = serviceName.toLowerCase()
    const terms: string[] = []

    // Always add original name first
    terms.push(name)

    // Remove text in parentheses (e.g., "xAI (Grok)" -> "xai")
    const cleanName = name.replace(/\s*\([^)]*\)/g, '').trim()
    
    // Add cleaned name if different from original
    if (cleanName !== name && cleanName.length > 2) {
      terms.push(cleanName)
    }

    // Remove common suffixes
    const withoutSuffix = cleanName
      .replace(/\b(status|api|developer|platform|service|app|inc|corp|ltd|llc)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Add withoutSuffix if different and valid
    if (withoutSuffix !== cleanName && withoutSuffix.length > 2) {
      terms.push(withoutSuffix)
    }

    // Try with spaces as hyphens
    if (cleanName.includes(' ')) {
      terms.push(cleanName.replace(/\s+/g, '-'))
    }

    // Try with spaces removed
    if (cleanName.includes(' ')) {
      terms.push(cleanName.replace(/\s+/g, ''))
    }

    // Remove duplicates and return
    return [...new Set(terms)].filter(term => term.length > 2)
  }

  private static async searchSVGL(term: string): Promise<LogoResult | null> {
    try {
      const url = `https://api.svgl.app?search=${encodeURIComponent(term)}`

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'force-cache',
      })

      if (!response.ok) {
        return null
      }

      const logos: SVGLResponse[] = await response.json()

      if (logos.length === 0) return null

      // Try to find exact match first (case-insensitive)
      const exactMatch = logos.find(logo => 
        logo.title.toLowerCase() === term.toLowerCase()
      )

      if (!exactMatch) return null

      const logo = exactMatch

      const route = logo.route
      const lightUrl = typeof route === 'object' ? route.light : route
      const darkUrl = typeof route === 'object' ? route.dark : route

      if (!lightUrl && !darkUrl) {
        return null
      }

      return { 
        url: darkUrl || lightUrl || '', 
        source: 'svgl',
        lightUrl,
        darkUrl
      }
    } catch {
      return null
    }
  }

  private static async trySimpleIcons(term: string): Promise<LogoResult | null> {
    try {
      const response = await fetch(`https://cdn.simpleicons.org/${encodeURIComponent(term)}`, {
        method: 'HEAD'
      })

      if (response.ok) {
        return {
          url: `https://cdn.simpleicons.org/${encodeURIComponent(term)}`,
          source: 'simpleicons'
        }
      }
    } catch {
      // Silently fail
    }
    return null
  }

  static clearCache(): void {
    this.cache.clear()
    this.failedCache.clear()
  }

  static async fetchLogo(serviceName: string, forceRefresh = false): Promise<LogoResult | null> {
    try {
      const cacheKey = serviceName.toLowerCase()

      if (!forceRefresh && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (cached !== undefined) {
          return cached
        }
      }

      if (!forceRefresh) {
        const failedAt = this.failedCache.get(cacheKey)
        if (failedAt && Date.now() - failedAt < this.FAILED_CACHE_DURATION) {
          return null
        }
      }

      if (this.HARDCODED_LOGOS[cacheKey]) {
        const logo = this.HARDCODED_LOGOS[cacheKey]
        this.cache.set(cacheKey, logo)
        this.failedCache.delete(cacheKey)
        return logo
      }

      // First, try to load SVGL logo list if not already loaded
      await this.loadSVGLLogoList()

      // Try SVGL local list first (no API calls!)
      const searchTerms = this.getSearchTerms(serviceName)
      for (const term of searchTerms.slice(0, 3)) {
        const localResult = this.searchSVGLLocal(term)
        if (localResult) {
          console.log(`[LogoFetcher] Found logo for "${serviceName}" in local SVGL list using term "${term}"`)
          this.cache.set(cacheKey, localResult)
          this.failedCache.delete(cacheKey)
          return localResult
        }
      }

      // If local search failed, try API (only if we don't have the full list yet)
      if (!this.svglLogoList || this.svglLogoList.length === 0) {
        for (const term of searchTerms.slice(0, 3)) {
          await this.rateLimit()

          const svglResult = await this.searchSVGL(term)
          if (svglResult) {
            console.log(`[LogoFetcher] Found logo for "${serviceName}" using API term "${term}"`)
            this.cache.set(cacheKey, svglResult)
            this.failedCache.delete(cacheKey)
            return svglResult
          }
        }
      }

      // If SVGL failed for all terms, try SimpleIcons with first term
      const firstTerm = searchTerms[0]
      if (firstTerm) {
        await this.rateLimit()
        const simpleIconsResult = await this.trySimpleIcons(firstTerm)
        if (simpleIconsResult) {
          console.log(`[LogoFetcher] Found logo for "${serviceName}" in SimpleIcons`)
          this.cache.set(cacheKey, simpleIconsResult)
          return simpleIconsResult
        }
      }

      console.log(`[LogoFetcher] No logo found for "${serviceName}" (tried: ${searchTerms.slice(0, 3).join(', ')})`)

      this.failedCache.set(cacheKey, Date.now())
      return null
    } catch (error) {
      console.error(`[LogoFetcher] Error:`, error)
      const cacheKey = serviceName.toLowerCase()
      this.failedCache.set(cacheKey, Date.now())
      return null
    }
  }

  static async test(serviceName: string): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      console.log('Test mode only in development')
      return
    }

    const cacheKey = serviceName.toLowerCase()
    this.cache.delete(cacheKey)
    this.failedCache.delete(cacheKey)
    const result = await this.fetchLogo(serviceName, true)
    console.log(`[LogoFetcher] Test "${serviceName}":`, result)
  }
}
