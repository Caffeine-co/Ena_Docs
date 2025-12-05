<template>
  <Layout>
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