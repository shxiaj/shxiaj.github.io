---
title: Gromacs
description: 分子动力学模拟工具使用与调优笔记
prev: false
next: false
---

# Gromacs

分子动力学模拟工具 Gromacs、VMD、Pymol 的使用与调优笔记。

<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const posts = ref([])

onMounted(async () => {
  const modules = import.meta.glob('./*.md', { eager: true })
  const results = []
  for (const [path, module] of Object.entries(modules)) {
    if (path.endsWith('/index.md')) continue
    const name = path.split('/').pop().replace('.md', '')
    if (module?.frontmatter) {
      results.push({ ...module.frontmatter, name })
    }
  }
  results.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  posts.value = results
})
</script>

<div class="post-list">
<div v-for="post in posts" :key="post.name" class="post-item">
  <a :href="withBase(`/gromacs/${post.name}`)">
    <span class="post-title">{{ post.title || post.name }}</span>
    <span class="post-date">{{ post.date }}</span>
  </a>
</div>
</div>

<style scoped>
.post-list { list-style: none; padding: 0; }
.post-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--vp-c-border);
}
.post-item a {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  text-decoration: none;
  color: var(--vp-c-text-1);
}
.post-item a:hover { color: var(--vp-c-brand-1); }
.post-title { font-size: 16px; font-weight: 500; }
.post-date { font-size: 13px; color: var(--vp-c-text-2); white-space: nowrap; margin-left: 16px; }
</style>
