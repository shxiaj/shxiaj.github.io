import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { createSidebar } from './sidebar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  lang: 'zh-CN',
  title: 'ShXiaJ Blog',
  description: 'AI, Java, Gromacs, Shell, Python, 工具软件等技术博客',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'AI', link: '/ai/' },
      { text: 'Gromacs', link: '/gromacs/' },
      { text: 'Java', link: '/java/' },
      { text: 'Linux', link: '/linux/' },
    ],
    sidebar: createSidebar(),
    search: {
      provider: 'local',
      options: {
        locales: {
          root: { placeholder: '搜索文章...' },
        },
      },
    },
    outline: { level: [2, 3], label: '目录' },
    lastUpdated: true,
    footer: {
      message: 'Copyright © 2021-2025 ShXiaJ',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ShXiaJ' },
    ],
  },
  markdown: {
    math: true,
    lineNumbers: true,
  },
  ignoreDeadLinks: [/dssp\.7z/],
})
