// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  // ...DefaultTheme,
  // Layout: () => {
    // return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    // })
  // },
  // 使用自定义的 Layout 组件来覆盖默认 Layout
  // 这样可以将 MusicPlayer 注入到全局结构中
  Layout: Layout,
  // enhanceApp({ app, router, siteData }) {
    // ...
  // }
  async enhanceApp() {
    if (!import.meta.env.SSR) {
      const base = import.meta.env.BASE_URL; // 自动 / 或 /repo/
      const { loadOml2d } = await import('oh-my-live2d');
      loadOml2d({
        dockedPosition: 'left',
        initialStatus: 'active',
        menus: {
          disable: true
        },
        mobileDisplay: true,
        models: [
          {
            anchor: [0, 0], // 设置模型在舞台中的锚点位置
            mobilePosition: [-55, 20], // 移动端时模型在舞台中的位置
            mobileScale: 0.1, // 移动端时模型的缩放比例
            mobileStageStyle: {
              width: '200px',
              height: '400px',
              pointerEvents: 'none',  // 不影响页面点击
            }, // 移动端舞台的样式
            motionPreloadStrategy: 'ALL',  // 动作预加载策略
            name: 'Ena', // 模型的唯一标识
            path: base + 'models/19ena_clathes2_4_t04/19ena_clathes2_4_t04.model3.json',
            // path: `${base}models/19ena_clathes2_4_t04/19ena_clathes2_4_t04.model3.json`,
            // path: '/models/19ena_clathes2_4_t04/19ena_clathes2_4_t04.model3.json',
            // path: 'models/19ena_cloth001_3.1_f_t01/19ena_cloth001_3.1_f_t01.model3.json',
            // path: '/models/19ena_cloth001_3.1_f_t01/19ena_cloth001_3.1_f_t01.model3.json',
            position: [-55, 20],  // 模型在舞台中的位置 25,100 -50, 75
            scale: 0.1, // 模型的缩放比例
            showHitAreaFrames: true,  // 是否显示该模型的点击区域框
            stageStyle: {
              width: '200px',
              height: '400px',
              pointerEvents: 'none',  // 不影响页面点击
            }
          }
        ],
        parentElement: document.body,
        primaryColor: '#ccaa88',
        sayHello: true,
        statusBar: {
          // 在这里进行配置
          disable: false,
          errorColor: '#ccaa88',
          loadFailMessage: '模型加载失败',
          loadSuccessMessage: '模型加载成功',
          loadingMessage: '模型加载中',
          reloadMessage: '重新加载模型',
        },
        tips: {
          style: {
            width: '150px',
            height: '100px',
          },
          copyTips: {
            duration: 3000,
            message: [
              // 复制网站文字内容时的提示内容数组
              '你复制了什么？如果是我的画，记得要标注出处哦！',
              '别随便拿去乱用啊，这可是常识。',
              '哼，虽然不知道你要做什么，但品味还算不错嘛。',
              '喂，复制完了吗？别打扰我画画。'
            ],
            priority: 3
          },
          idleTips: {
            duration: 5000,
            interval: 10000,
            message: [
              // 闲置状态下的提示内容数组
              // '一直在发呆……如果你很闲的话，不如来帮我点个赞？',
              '哈……这张线稿怎么看都不顺眼，重画好了。',
              '如果你是在等我说话，那我只能说——你是笨蛋吗？',
              '瑞希那家伙，又在群里发什么奇怪的表情包……',
              '想吃芝士蛋糕了……要是彰人在的话就能让他去买了。',
              '一直盯着我看干什么？虽然我知道我很可爱。',
              '啊——灵感完全没有！怎么画都画不好！',
              // '稍微刷一下社交动态吧，看看今天的自拍反响如何。'
            ],
            priority: 2,
            wordTheDay: false
          },
          messageLine: 6,
          welcomeTips: {
            duration: 6000,
            message: {
              // 凌晨 0-4 点：25时的活动时间，也是绘名最清醒的时候
              weeHours: '这不是还没睡吗？正好，25时的活动才刚刚开始呢。',
              // 早晨 5-7 点：通宵后的疲惫或不情愿的早起
              daybreak: '哈欠……天亮了？不管是通宵还是早起，这个时候都很痛苦啊。',
              // 早上 8-11 点：通常在补觉或上学迟到
              morning: '这种时间……好困……如果是为了去学校，那我宁愿继续睡。',
              // 中午 12-13 点：午休
              noon: '午饭时间吗？比起正餐，我更想吃松饼或者芝士蛋糕啊。',
              // 下午 14-17 点：自拍黄金时间/画画时间
              afternoon: '现在的光线不错，是个自拍的好机会……咳，你什么都没看见。',
              // 傍晚 18-19 点
              dusk: '天黑了啊……差不多该准备晚饭了，虽然有点麻烦。',
              // 晚上 20-21 点：准备上线
              night: '作业？那种东西……大概做完了吧。别问我。',
              // 深夜 22-23 点：Nightcord 集合前
              lateNight: '快到集合时间了。准备好了吗？要是拖后腿我可不管你哦。'
            },
            priority: 3,
          }
        },
        transitionTime: 1000
      });
    }
  }
} satisfies Theme
