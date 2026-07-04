<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  posts: { type: Array, required: true }
})

const selectedTag = ref('全部')

const allTags = computed(() => {
  const tagSet = new Set()
  props.posts.forEach(p => {
    const tags = p.frontmatter?.tags || []
    tags.forEach(t => tagSet.add(t))
  })
  return ['全部', ...tagSet]
})

const filteredPosts = computed(() => {
  if (selectedTag.value === '全部') return props.posts
  return props.posts.filter(p => (p.frontmatter?.tags || []).includes(selectedTag.value))
})
</script>

<template>
  <div class="post-list-page">
    <div class="tag-filter">
      <button
        v-for="tag in allTags"
        :key="tag"
        :class="{ active: selectedTag === tag }"
        @click="selectedTag = tag"
      >
        {{ tag }}
      </button>
    </div>
    <div class="posts">
      <div v-for="post in filteredPosts" :key="post.slug" class="post-item">
        <time class="post-date">{{ new Date(post.frontmatter?.date || '').toLocaleDateString('zh-CN') }}</time>
        <a :href="post.frontmatter?.path" class="post-title">{{ post.frontmatter?.title }}</a>
        <div class="post-tags">
          <span v-for="tag in post.frontmatter?.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.tag-filter button {
  padding: 4px 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.tag-filter button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.tag-filter button.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}
.posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.post-item {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.post-date {
  font-size: 13px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  min-width: 100px;
}
.post-title {
  flex: 1;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
}
.post-title:hover {
  color: var(--vp-c-brand-1);
}
.post-tags {
  display: flex;
  gap: 6px;
}
.tag {
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-mute);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
