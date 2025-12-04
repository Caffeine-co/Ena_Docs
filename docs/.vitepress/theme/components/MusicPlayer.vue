<template>
  <div 
    class="floating-player" 
    :class="{ 'is-playing': isPlaying, 'is-hovered': isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 唱片/封面区域 -->
    <div class="player-disc" @click="togglePlay">
      <div class="disc-cover" :style="{ backgroundImage: `url(${currentTrack.cover || '/music/default-cover.png'})` }">
        <div class="disc-center"></div>
      </div>
    </div>

    <!-- 播放器主体内容 -->
    <div class="player-content">
      <!-- 歌曲信息 (悬停时显示) -->
      <div class="track-details" v-show="isHovered || isMobile">
        <div class="track-name">{{ currentTrack.title }}</div>
        <div class="track-artist">{{ currentTrack.artist }}</div>
      </div>

      <!-- 控制按钮 -->
      <div class="player-controls">
        
        <!-- 新增: 循环模式按钮 -->
        <button 
          class="ctrl-btn loop-btn" 
          @click.stop="toggleLoopMode" 
          :title="loopMode === 'list' ? '循环列表' : '单曲循环'"
          :class="{ 'is-active': loopMode === 'single' }"
        >
          <!-- 列表循环 (Repeat All) Icon -->
          <svg v-if="loopMode === 'list'" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          <!-- 单曲循环 (Repeat One) Icon - **修改为包含数字 1** -->
          <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
              <!-- 数字 "1" 标记 -->
              <path d="M12 10.5L12 15M11 11.5L12 10.5L13 11.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
          </svg>
        </button>
        <!-- 结束: 循环模式按钮 -->

        <button class="ctrl-btn prev" @click.stop="prevTrack" title="上一首">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
        </button>
        
        <button class="ctrl-btn toggle" @click.stop="togglePlay" :title="isPlaying ? '暂停' : '播放'">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        </button>
        
        <button class="ctrl-btn next" @click.stop="nextTrack" title="下一首">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
        </button>
      </div>
      
      <!-- 进度条 (悬停时显示) -->
      <div class="mini-progress" v-show="isHovered || isMobile" @click.stop="seek">
        <!-- 移除了冗余的 progress-bg 元素，让 progress-fill 直接作为子元素 -->
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      
      <!-- 新增: 音量控制 (悬停时显示) -->
      <div class="volume-control" v-show="isHovered || isMobile">
        <!-- 音量图标 -->
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <!-- 大音量或中音量图标路径 -->
            <path v-if="volume > 0.5" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <!-- 小音量或静音图标路径 -->
            <path v-else-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <!-- 静音/无声图标：使用 X (叉号) 表示静音 -->
            <template v-else>
                <line x1="14" y1="8" x2="20" y2="16"></line>
                <line x1="20" y1="8" x2="14" y2="16"></line>
            </template>
        </svg>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          :value="volume" 
          @input="setVolume"
          class="volume-slider"
          title="调整音量"
        />
      </div>

      <!-- 新增: 时间显示 (已注释掉，移除 X:XX / X:XX 显示) -->
      <!--
      <div class="time-display" v-show="isHovered || isMobile">
        <span>{{ formattedTime }}</span> / <span>{{ formattedDuration }}</span>
      </div>
      -->
    </div>

    <!-- 隐藏的 Audio 元素 -->
    <audio 
      ref="audioRef" 
      :src="currentTrack.src" 
      @timeupdate="onTimeUpdate" 
      @ended="onTrackEnded"
      @loadedmetadata="onLoadedMetadata"
      preload="auto"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// --- 播放列表配置 (请根据实际情况修改) ---
const playlist = [
  {
    title: "限りなく灰色へ",
    artist: "25時、ナイトコードで。",
    src: "/music/01 限りなく灰色へ.wav", 
    cover: "/music/jacket_s_090.png" 
  },
  {
    title: "アイディスマイル",
    artist: "25時、ナイトコードで。",
    src: "/music/02 アイディスマイル.wav", 
    cover: "/music/jacket_s_116.png" 
  },
  {
    title: "限りなく灰色へ (instrumental)",
    artist: "25時、ナイトコードで。",
    src: "/music/03 限りなく灰色へ (instrumental).wav", 
    cover: "/music/jacket_s_090.png" 
  },
  {
    title: "アイディスマイル (instrumental)",
    artist: "25时、ナイトコードで。",
    src: "/music/04 アイディスマイル (instrumental).wav", 
    cover: "/music/jacket_s_116.png" 
  },
]

// --- 状态管理 ---
const isPlaying = ref(false)
const isHovered = ref(false)
const isMobile = ref(false) // 用于检测移动端，保持展开状态
const currentTrackIndex = ref(0)
const audioRef = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1.0) // 音量状态 (0.0 到 1.0)
const loopMode = ref('list') // 'list' (循环列表) or 'single' (单曲循环)

const currentTrack = computed(() => playlist[currentTrackIndex.value] || {})

// 时间格式化工具
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  // 确保秒数是两位数
  const paddedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds
  return `${minutes}:${paddedSeconds}`
}

// 计算属性：进度百分比
const progress = computed(() => {
  // 核心计算逻辑： (当前时间 / 总时长) * 100
  if (!duration.value || isNaN(duration.value) || duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 计算属性：格式化的当前时间
const formattedTime = computed(() => formatTime(currentTime.value))
// 计算属性：格式化的总时长
const formattedDuration = computed(() => formatTime(duration.value))

// --- 核心逻辑 ---
const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false // 暂停时，明确设置状态
  } else {
    playAudio()
  }
}

const playAudio = () => {
  if (!audioRef.value) return
  const playPromise = audioRef.value.play()
  if (playPromise !== undefined) {
    playPromise
      .then(() => { 
        isPlaying.value = true // 成功播放，设置状态
      })
      .catch((error) => { 
        // 播放失败，可能是浏览器阻止了自动播放
        console.error("播放失败，请点击播放按钮手动播放。", error);
        isPlaying.value = false;
      })
  }
}

const nextTrack = () => {
  let next = currentTrackIndex.value + 1
  if (next >= playlist.length) next = 0
  currentTrackIndex.value = next
}

const prevTrack = () => {
  let prev = currentTrackIndex.value - 1
  if (prev < 0) prev = playlist.length - 1
  currentTrackIndex.value = prev
}

const onTrackEnded = () => {
  if (loopMode.value === 'single') {
    // 单曲循环: 重置时间并重新播放
    audioRef.value.currentTime = 0;
    playAudio();
  } else {
    // 列表循环: 播放下一首
    nextTrack();
  }
}

const toggleLoopMode = () => {
  loopMode.value = loopMode.value === 'list' ? 'single' : 'list';
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    // 更新当前播放时间，这将驱动 formattedTime 和 progress 变化
    currentTime.value = audioRef.value.currentTime
  }
  
  // 持续检查 duration，确保在任何时候都能获取到
  if (audioRef.value && duration.value === 0 && audioRef.value.duration) {
      duration.value = audioRef.value.duration
  }
}

const onLoadedMetadata = () => {
  if (audioRef.value) duration.value = audioRef.value.duration
}

const seek = (e) => {
  // 只有当 duration 有效时才允许拖动
  if (!audioRef.value || !duration.value || duration.value === 0) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const percentage = x / rect.width
  audioRef.value.currentTime = percentage * duration.value
}

// 音量控制函数
const setVolume = (e) => {
  const newVolume = parseFloat(e.target.value);
  volume.value = newVolume;
  if (audioRef.value) {
    audioRef.value.volume = newVolume;
  }
}

// 监听切歌
watch(currentTrackIndex, () => {
  currentTime.value = 0
  if (audioRef.value) {
    // 强制加载新的音频源，确保元数据更新和准备播放
    audioRef.value.load(); 
  }
  // 尝试播放
  setTimeout(() => playAudio(), 100)
})

onMounted(() => {
  // 简单的移动端检测
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })

  // 在组件挂载后显式调用 load()，确保浏览器加载音频元数据
  if (audioRef.value) {
      audioRef.value.load(); 
      // 关键：设置初始音量
      audioRef.value.volume = volume.value;
  }

  // 尝试自动播放 
  setTimeout(() => playAudio(), 1000)
})
</script>

<style scoped>
/* --- 容器定位 --- */
.floating-player {
  position: fixed;
  /* PC端：右上角，距离顶部一定距离避开Header */
  top: 100px; 
  right: 20px;
  z-index: 100;
  
  display: flex;
  align-items: center;
  background: var(--vp-c-bg-soft); /* 适配深色/浅色模式背景 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  border: 1px solid var(--vp-c-divider);
  border-radius: 50px; /* 胶囊形状 */
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 8px;
  padding-right: 20px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: auto;
  max-width: 300px;
}

/* 悬停或移动端时，增加阴影深度 */
.floating-player:hover, .floating-player.is-hovered {
  box-shadow: 0 8px 30px rgba(0,0,0,0.25);
  background: var(--vp-c-bg);
}

/* --- 唱片/封面动画 --- */
.player-disc {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid var(--vp-c-bg);
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 2;
  margin-right: 12px;
}

/* 旋转动画 */
.disc-cover {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  animation: rotate 10s linear infinite;
  animation-play-state: paused;
  position: relative;
}
.floating-player.is-playing .disc-cover {
  animation-play-state: running;
}

/* 唱片中间的小圆点 */
.disc-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: var(--vp-c-bg);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid var(--vp-c-divider);
}

/* --- 播放器主体 --- */
.player-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

/* --- 歌曲信息 --- */
.track-details {
  margin-bottom: 4px;
  animation: fadeIn 0.3s ease;
}
.track-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* 1. 在这里添加 color 属性来改变歌名颜色 */
  /* 例如：改为红色 */
  /* color: #ff4d4f; */ 
  /* 或者使用主题主色调 */
  /* color: var(--vp-c-brand); */
}
.track-artist {
  font-size: 11px;
  
  /* 2. 这里控制歌手文字颜色 */
  /* 默认为次级文本色 var(--vp-c-text-2) */
  color: var(--vp-c-text-2); 
  
  line-height: 1.2;
}

/* --- 控制按钮 --- */
.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ctrl-btn {
  background: none;
  border: none;
  padding: 0;
  
  /* 3. 这里控制按钮图标的默认颜色 */
  /* 默认为主要文本色 var(--vp-c-text-1) */
  color: var(--vp-c-text-1);
  
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, transform 0.1s;
}
.ctrl-btn:hover {
  /* 4. 这里控制鼠标悬停时按钮的颜色 */
  color: var(--vp-c-brand);
}
/* 激活状态下的循环按钮高亮 */
.ctrl-btn.loop-btn.is-active {
    color: var(--vp-c-brand);
}

/* --- 控制按钮 --- */
.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ctrl-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--vp-c-text-1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, transform 0.1s;
}
.ctrl-btn:hover {
  color: var(--vp-c-brand);
}
.ctrl-btn:active {
  transform: scale(0.9);
}

/* --- 迷你进度条 (歌曲进度) --- */
.mini-progress {
  height: 3px;
  width: 100%;
  background: var(--vp-c-divider);
  border-radius: 2px;
  margin-top: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.progress-fill {
  height: 100%; 
  background: var(--vp-c-brand);
  border-radius: 2px;
  transition: width 0.1s linear; 
}

/* --- 音量控制样式 --- */
.volume-control {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px; /* 放在进度条下面 */
  animation: fadeIn 0.3s ease;
}
.volume-control svg {
    color: var(--vp-c-text-2);
}

/* --- 音量进度条样式 (目标: 修复 WebKit 渲染问题) --- */
.volume-slider {
  /* 基础重置和尺寸 */
  -webkit-appearance: none;
  appearance: none;
  width: 100px;
  height: 3px; /* 匹配歌曲进度条高度 */
  background: transparent; 
  outline: none;
  opacity: 1; 
  transition: opacity 0.2s;
  cursor: pointer;
  padding: 0; 
  margin: 0; 
}

/* 轨道样式 (Webkit - Chrome/Safari) */
.volume-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 3px; 
  background: var(--vp-c-divider); /* 背景色 */
  border-radius: 2px;
  cursor: pointer;
}

/* 滑块头样式 (Webkit - Chrome/Safari) - 已修复：移除 box-shadow 填充黑客，改为小圆点滑块 */
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 8px; /* 减小滑块尺寸 */
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand); /* 使用主题色作为滑块颜色 */
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* 添加轻微阴影 */
  /* margin-top 使 8px 的滑块居中于 3px 的轨道上 */
  margin-top: -2.5px; 
  /* 移除了导致渲染错误的 box-shadow 进度条填充黑客 */
}

/* 轨道样式 (Firefox) */
.volume-slider::-moz-range-track {
  width: 100%;
  height: 3px;
  background: var(--vp-c-divider);
  border-radius: 2px;
  cursor: pointer;
}

/* 进度填充样式 (Firefox) - Firefox 支持这个来直接显示进度 */
.volume-slider::-moz-range-progress {
  background: var(--vp-c-brand); 
  height: 3px;
  border-radius: 2px;
}

/* 滑块头样式 (Mozilla) */
.volume-slider::-moz-range-thumb {
  width: 8px; /* 减小滑块尺寸 */
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand); /* 使用主题色作为滑块颜色 */
  cursor: pointer;
  border: none;
}


/* --- 动画关键帧 --- */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- 移动端适配 --- */
@media (max-width: 768px) {
  .floating-player {
    /* 保持右上角定位 */
    top: 70px; 
    bottom: auto;
    right: 10px; 
    /* 缩放基点改为右上角 */
    transform-origin: right top;
    transform: scale(0.9);
  }
  
  .track-name {
    max-width: 100px; /* 移动端屏幕较窄，防止歌名过长 */
  }
}
</style>