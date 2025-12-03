import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/Ena_Docs/',
  title: 'えななん',  // Enanan
  titleTemplate: 'Enanan',
  description: 'Enanan',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // logo: '/images/ena_qute_head.png',
    logo: {
      light: '/images/ena_qute_head.png',
      dark: '/images/ena_qute_head.png',
    },
    siteTitle: 'Enanan',
    nav: [
      { text: '主页', link: '/' }
    ],
    // sidebar: [
      // {
        // text: 'Examples',
        // collapsed: false,
        // items: [
          // { text: 'Markdown Examples', link: '/markdown-examples' },
          // { text: 'Runtime API Examples', link: '/api-examples' }
        // ]
      // }
    // ],
    // sidebar: false, // 关闭侧边栏
    aside: true,
    outline: {
      label: '页面导航'
    },
    socialLinks: [
      { icon: 'qq', link: 'https://qm.qq.com/q/HCCXnhlyKc' },
      { icon: 'github', link: 'https://github.com/Caffeine-co/Ena_Docs' },
      { icon: 'x', link: 'https://x.com/hashtag/東雲絵名' },
      { icon: 'discord', link: 'https://discord.gg/B52jmxwK' }
    ],
    footer: {
      message: 'MIT ベースのライセンス',  // 基于 MIT 许可发布
      copyright: 'Copyright © 2025 咖啡不甜'
      // message: 'Released under the MIT License.',
      // copyright: '版权所有 © 2019-至今 尤雨溪'
      // copyright: 'Copyright © 2019-present Evan You'
    },
    editLink: {
      pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
      text: 'Github でこのページを編集する'  // 在 GitHub 上编辑此页面
    },
    lastUpdated: {
      text: '最后更新于'
    },
    docFooter: {
      prev: '前のページ', // 上一页
      next: '次のページ'  // 下一页
    },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: 'ライトモードに切り替える', // 切换到浅色模式
    darkModeSwitchTitle: '濃い色モードに切り替える',  // 切换到深色模式
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    // 设置搜索框的样式
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: "ドキュメントの検索", // 搜索文档
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "関連する結菓が見つかりませんでした",  // 未找到相关结果
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    }
  }
})
