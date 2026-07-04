import { h } from 'vue'
import Theme from 'vitepress/theme'
import PostList from './PostList.vue'

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.component('PostList', PostList)
  },
}
