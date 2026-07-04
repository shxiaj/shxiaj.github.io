import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { createSidebar } from './sidebar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  lang: 'zh-CN',
  title: 'ShXiaJ Blog',
  description: 'Java, Gromacs, Shell, Python, 工具软件等技术博客',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    // Giscus comments
    // ⚠️ 部署前必须完成：
    // 1. https://github.com/ShXiaJ/blog/settings/discussions → Enable Discussions
    // 2. https://giscus.app → 输入 ShXiaJ/blog → 创建 category "Blog Comments"
    // 3. 将下方 repo-id 和 category-id 替换为真实值
    ['script', {
      src: 'https://giscus.app/client.js',
      'data-repo': 'ShXiaJ/blog',
      'data-repo-id': 'TODO: 替换为你的 repo ID',
      'data-category': 'Blog Comments',
      'data-category-id': 'TODO: 替换为你的 category ID',
      'data-mapping': 'pathname',
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': 'preferred_color_scheme',
      'data-lang': 'zh-CN',
      'data-loading': 'lazy',
      crossorigin: 'anonymous',
      async: '',
    }],
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
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
