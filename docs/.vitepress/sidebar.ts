import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = resolve(__dirname, '../../docs')

interface FrontMatter {
  title?: string
  description?: string
  date?: string
}

interface SidebarItem {
  text: string
  link: string
  description?: string
}

/**
 * Parse frontmatter from a markdown file.
 */
function parseFrontmatter(content: string): FrontMatter {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return {}
  const fm: FrontMatter = {}
  for (const line of match[1].split('\n')) {
    const [key, ...valueParts] = line.split(':')
    const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '')
    if (key && value !== undefined) {
      ;(fm as Record<string, unknown>)[key.trim()] = value
    }
  }
  return fm
}

/**
 * Generate sidebar items for a given category directory.
 */
function generateCategorySidebar(category: string): SidebarItem[] {
  const dir = resolve(DOCS_ROOT, category)
  const files = readdirSync(dir).filter((f: string) => f.endsWith('.md') && f !== 'index.md')

  const items: SidebarItem[] = []
  for (const file of files) {
    const content = readFileSync(resolve(dir, file), 'utf-8')
    const fm = parseFrontmatter(content)
    const link = `/${category}/${file.replace('.md', '')}/`
    items.push({
      text: fm.title || file.replace('.md', ''),
      link,
      description: fm.description,
    })
  }

  // Sort by frontmatter `date` descending, then by filename
  items.sort((a, b) => {
    return b.link.localeCompare(a.link)
  })

  return items
}

/**
 * Build the full sidebar configuration object.
 */
export function createSidebar(): Record<string, { text: string; items: SidebarItem[] }[]> {
  const categories = ['ai', 'gromacs', 'java', 'linux']

  const sidebar: Record<string, { text: string; items: SidebarItem[] }[]> = {}
  for (const cat of categories) {
    const items = generateCategorySidebar(cat)
    sidebar[`/${cat}/`] = [{ text: cat.charAt(0).toUpperCase() + cat.slice(1), items }]
  }

  return sidebar
}
