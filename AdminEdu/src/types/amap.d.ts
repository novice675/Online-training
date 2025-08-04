// 高德地图 TypeScript 类型声明
declare global {
  interface Window {
    AMap: any
  }
}

declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, options?: any)
    setCenter(center: [number, number]): void
    on(event: string, callback: (e: any) => void): void
    add(marker: any): void
    remove(marker: any): void
    destroy(): void
  }

  class Marker {
    constructor(options: {
      position: [number, number]
      title?: string
    })
  }

  class Geocoder {
    constructor(options?: {
      radius?: number
      extensions?: string
    })
    getAddress(location: [number, number], callback: (status: string, result: any) => void): void
  }

  class PlaceSearch {
    constructor(options?: {
      pageSize?: number
      pageIndex?: number
      city?: string
    })
    search(keyword: string, callback: (status: string, result: any) => void): void
  }
}

export {} 