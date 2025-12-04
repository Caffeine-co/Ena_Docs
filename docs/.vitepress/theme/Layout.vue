<template>
  <Layout>
    <!-- 使用 layout-bottom 插槽，确保内容被插入到页面底部 -->
    <!-- 也可以直接放在 Layout 组件外面，作为同级元素 -->
    <template #layout-bottom>
      <MusicPlayer />
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import MusicPlayer from './components/MusicPlayer.vue'

const { Layout } = DefaultTheme
</script>