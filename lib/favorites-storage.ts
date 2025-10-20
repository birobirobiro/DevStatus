const STORAGE_KEY = "devstatus_favorites";

export class FavoritesStorage {
  static getFavorites(): string[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading favorites:", error);
      return [];
    }
  }

  static saveFavorites(favorites: string[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }

  static toggleFavorite(serviceId: string): boolean {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(serviceId);

    if (index > -1) {
      favorites.splice(index, 1);
      this.saveFavorites(favorites);
      return false; // removed
    } else {
      favorites.push(serviceId);
      this.saveFavorites(favorites);
      return true; // added
    }
  }

  static isFavorite(serviceId: string): boolean {
    return this.getFavorites().includes(serviceId);
  }

  static clearFavorites(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }

  static exportFavorites(): string {
    const favorites = this.getFavorites();
    return JSON.stringify(favorites, null, 2);
  }

  static importFavorites(jsonString: string): boolean {
    try {
      const favorites = JSON.parse(jsonString);
      if (Array.isArray(favorites)) {
        this.saveFavorites(favorites);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing favorites:", error);
      return false;
    }
  }
}

