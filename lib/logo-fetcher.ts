export interface LogoResult {
  url: string
  source: string
}

export class LogoFetcher {
  private static cache = new Map<string, LogoResult | null>()

  static async fetchLogo(serviceName: string): Promise<LogoResult | null> {
    // Check cache first
    const cacheKey = serviceName.toLowerCase()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) || null
    }

    const searchTerms = this.generateSearchTerms(serviceName)

    for (const term of searchTerms) {
      // Try SVGL API first
      const svglResult = await this.tryFetchFromSVGL(term)
      if (svglResult) {
        this.cache.set(cacheKey, svglResult)
        return svglResult
      }

      // Try Simple Icons as fallback
      const simpleIconsResult = await this.tryFetchFromSimpleIcons(term)
      if (simpleIconsResult) {
        this.cache.set(cacheKey, simpleIconsResult)
        return simpleIconsResult
      }
    }

    // Cache miss result
    this.cache.set(cacheKey, null)
    return null
  }

  private static generateSearchTerms(serviceName: string): string[] {
    const name = serviceName.toLowerCase()
    const terms = new Set<string>()

    // Original name
    terms.add(name)

    // Remove common words
    const cleanName = name.replace(/\b(status|api|developer|platform|service|app|inc|corp|ltd|llc)\b/g, "").trim()
    if (cleanName) terms.add(cleanName)

    // Without spaces
    terms.add(name.replace(/\s+/g, ""))

    // With hyphens
    terms.add(name.replace(/\s+/g, "-"))

    // With underscores
    terms.add(name.replace(/\s+/g, "_"))

    // First word only
    const firstWord = name.split(" ")[0]
    if (firstWord.length > 2) terms.add(firstWord)

    // Company-specific mappings
    const mappings: Record<string, string[]> = {
      "google cloud platform": ["google", "gcp", "googlecloud"],
      "microsoft teams": ["microsoft", "teams"],
      "amazon web services": ["aws", "amazon"],
      "digital ocean": ["digitalocean"],
      "new relic": ["newrelic"],
      "docker hub": ["docker"],
      "hugging face": ["huggingface"],
      "apple developer": ["apple"],
      github: ["github"],
      gitlab: ["gitlab"],
      "mongodb atlas": ["mongodb"],
      "whatsapp business": ["whatsapp"],
    }

    if (mappings[name]) {
      mappings[name].forEach((term) => terms.add(term))
    }

    return Array.from(terms).filter((term) => term.length > 1)
  }

  private static async tryFetchFromSVGL(searchTerm: string): Promise<LogoResult | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`https://api.svgl.app/search/${encodeURIComponent(searchTerm)}`, {
        signal: controller.signal,
        method: "GET",
        headers: { Accept: "application/json" },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data && Array.isArray(data) && data.length > 0) {
          const result = data[0]
          let svgUrl = null

          if (typeof result.route === "string") {
            svgUrl = result.route
          } else if (typeof result.route === "object" && result.route !== null) {
            svgUrl = result.route.light || result.route.dark
          }

          if (svgUrl) {
            if (svgUrl.startsWith("/")) {
              svgUrl = `https://svgl.app${svgUrl}`
            }
            return { url: svgUrl, source: "svgl" }
          }
        }
      }
    } catch (error) {
      // Silently fail and try next source
    }
    return null
  }

  private static async tryFetchFromSimpleIcons(searchTerm: string): Promise<LogoResult | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      // Simple Icons CDN format
      const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${searchTerm}.svg`

      const response = await fetch(url, {
        signal: controller.signal,
        method: "HEAD", // Just check if it exists
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return { url, source: "simple-icons" }
      }
    } catch (error) {
      // Silently fail
    }
    return null
  }
}
