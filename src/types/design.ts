export interface Design {
  slug: string
  name: string
  categories: string[]
  colors: {
    primary: string
    secondary: string
  }
  defaultMode: 'light' | 'dark'
  jsonUrl: string
  thumbnailUrl: string
  detailUrl: string
  description?: string
}
