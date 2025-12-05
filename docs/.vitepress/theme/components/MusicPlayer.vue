<template>
  <div 
    ref="playerContainer"
    class="music-player-wrapper" 
    :class="{ 'is-expanded': isExpanded, 'is-mobile': isMobile }"
  >
    <!-- 唱片区域 (点击切换收纳/展开) -->
    <div class="disc-area" @click.stop="handleDiscClick">
      
      <!-- 收纳状态下的环形进度条 (SVG) -->
      <svg class="circular-progress" width="90" height="90" viewBox="0 0 90 90" v-show="!isExpanded">
        <!-- 背景圆环 (半径 42, 描边宽度 3) -->
        <circle cx="45" cy="45" r="42" fill="none" stroke="var(--vp-c-divider)" stroke-width="3" />
        <!-- 进度圆环 -->
        <!-- cx/cy=45, r=42, 周长约 264 -->
        <circle 
          cx="45" cy="45" r="42" 
          fill="none" 
          stroke="var(--vp-c-brand)" 
          stroke-width="3" 
          stroke-linecap="round"
          class="progress-ring"
          :style="{ strokeDasharray: circumference, strokeDashoffset: dashOffset }"
          transform="rotate(-90 45 45)"
        />
      </svg>

      <!-- 唱片本体 -->
      <div class="disc-rotate-wrapper" :class="{ 'is-spinning': isPlaying }">
        <div 
          class="disc-cover" 
          :style="{ backgroundImage: `url(${currentTrack.cover || '/music/default-cover.png'})` }"
        >
          <div class="disc-hole"></div>
        </div>
      </div>
    </div>

    <!-- 展开后的控制面板 -->
    <div class="controls-panel" @click.stop>
      <!-- 第一行：滚动歌曲信息 -->
      <div class="panel-row info-row">
        <div class="scrolling-text-container" :class="{ 'is-scrolling': isPlaying && isExpanded }">
          <div class="scrolling-content">
            <span class="song-title">{{ currentTrack.title }}</span>
            <span class="song-artist"> - {{ currentTrack.artist }}</span>
            <!-- 重复一份用于无缝滚动 -->
            <span class="song-title spacer">{{ currentTrack.title }}</span>
            <span class="song-artist"> - {{ currentTrack.artist }}</span>
          </div>
        </div>
      </div>

      <!-- 第二行：歌曲进度条 -->
      <div class="panel-row progress-row">
        <!-- 时间信息 (已优化为稳定显示) -->
        <div class="time-hint">
          <span class="current-time">{{ formatTime(currentTime) }}</span>
          <span class="separator">/</span>
          <span class="total-duration">{{ formatTime(duration) }}</span>
        </div>
        <div 
          class="custom-slider-track" 
          ref="progressBarRef"
          @mousedown="startDrag('progress', $event)"
          @touchstart="startDrag('progress', $event)"
        >
          <div class="slider-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- 第三行：音量控制 -->
      <div class="panel-row volume-row">
        <div class="volume-icon" @click="toggleMute">
           <svg v-if="volume > 0.5" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
           <svg v-else-if="volume > 0" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
           <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        </div>
        <div 
          class="custom-slider-track" 
          ref="volumeBarRef"
          @mousedown="startDrag('volume', $event)"
          @touchstart="startDrag('volume', $event)"
        >
          <div class="slider-fill" :style="{ width: (volume * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 第四行：播放控制按钮 -->
      <div class="panel-row buttons-row">
        <!-- 循环模式 -->
        <button class="btn-icon small" @click="toggleLoopMode" :title="loopMode === 'list' ? '列表循环' : '单曲循环'">
          <svg v-if="loopMode === 'list'" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path><text x="10" y="15" font-size="8" fill="currentColor" stroke="none" font-weight="bold">1</text></svg>
        </button>

        <!-- 上一首 -->
        <button class="btn-icon" @click="prevTrack">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
        </button>

        <!-- 播放/暂停 -->
        <button class="btn-icon" @click="togglePlay">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        </button>

        <!-- 下一首 -->
        <button class="btn-icon" @click="nextTrack">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
        </button>
      </div>
    </div>

    <audio ref="audioRef" :src="currentTrack.src" preload="auto"></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// --- 数据配置 ---
// 请将音乐文件放在 docs/public/music/ 文件夹下
const playlist = [
  {
    title: "限りなく灰色へ",
    artist: "25時、ナイトコードで。",
    src: "/music/01 限りなく灰色へ.wav", 
    cover: "/music/jacket_s_090.png" 
  },
  {
    title: "限りなく灰色へ (instrumental)",
    artist: "25時、ナイトコードで。",
    src: "/music/03 限りなく灰色へ (instrumental).wav", 
    cover: "/music/jacket_s_090.png" 
  },
  // { title: "アイディスマイル", artist: "25時、ナイトコードで。", src: "/music/02 アイディスマイル.wav", cover: "/music/jacket_s_116.png" },
  // { title: "アイディスマイル (instrumental)", artist: "25時、ナイトコードで。", src: "/music/04 アイディスマイル (instrumental).wav", cover: "/music/jacket_s_116.png" },
]

// --- 状态 ---
const isExpanded = ref(false)
const isPlaying = ref(false)
const currentTrackIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.5)
const loopMode = ref('list') // 'list' | 'single'
const isMobile = ref(false)

// DOM Refs
const audioRef = ref(null)
const playerContainer = ref(null)
const progressBarRef = ref(null)
const volumeBarRef = ref(null)

// --- 计算属性 ---
const currentTrack = computed(() => playlist[currentTrackIndex.value] || { title: "无歌曲", artist: "N/A", src: "", cover: "" })
const progressPercent = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)

// SVG 圆环计算 (r=42 => 周长 2 * PI * 42 ≈ 263.89)
const circumference = 264
const dashOffset = computed(() => circumference - (progressPercent.value / 100) * circumference)

// --- 核心逻辑 ---

// 初始化
onMounted(() => {
  setupAudioEvents()
  checkMobile()
  window.addEventListener('resize', checkMobile)
  // 全局点击监听：实现点击外部收纳
  window.addEventListener('click', handleClickOutside)
  
  // 默认尝试播放 (浏览器可能会拦截)
  setTimeout(() => {
    if (audioRef.value) {
      audioRef.value.volume = volume.value
      playAudio()
    }
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('click', handleClickOutside)
  if (audioRef.value) {
    audioRef.value.pause()
  }
})

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// 展开/收纳
const handleDiscClick = () => {
  isExpanded.value = !isExpanded.value
}

const handleClickOutside = (event) => {
  // 只有在处于展开状态且点击目标不在播放器容器内时，才收纳
  if (isExpanded.value && playerContainer.value && !playerContainer.value.contains(event.target)) {
    isExpanded.value = false
  }
}

// 音频控制
const setupAudioEvents = () => {
  const audio = audioRef.value
  if (!audio) return

  audio.addEventListener('timeupdate', () => {
    // 仅在非拖动状态下才更新 currentTime，防止 timeupdate 事件干扰拖动平滑度
    if(!isDragging.value) currentTime.value = audio.currentTime
  })
  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio.duration
  })
  audio.addEventListener('ended', onTrackEnded)
  audio.addEventListener('error', (e) => console.error("Audio Error:", e))
}

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    playAudio()
  }
}

const playAudio = async () => {
  if (!audioRef.value) return
  try {
    audioRef.value.volume = volume.value;
    await audioRef.value.play()
    isPlaying.value = true
  } catch (err) {
    console.warn("Autoplay blocked or playback failed:", err)
    isPlaying.value = false
  }
}

const nextTrack = () => {
  let next = currentTrackIndex.value + 1
  if (next >= playlist.length) next = 0
  switchTrack(next)
}

const prevTrack = () => {
  let prev = currentTrackIndex.value - 1
  if (prev < 0) prev = playlist.length - 1
  switchTrack(prev)
}

const switchTrack = (index) => {
  currentTrackIndex.value = index
  currentTime.value = 0
  isPlaying.value = false // 先暂停 UI 状态
  
  nextTick(() => {
    if (audioRef.value) {
      audioRef.value.load()
      playAudio()
    }
  })
}

const onTrackEnded = () => {
  if (loopMode.value === 'single') {
    audioRef.value.currentTime = 0
    playAudio()
  } else {
    nextTrack()
  }
}

const toggleLoopMode = () => {
  loopMode.value = loopMode.value === 'list' ? 'single' : 'list'
}

const toggleMute = () => {
  if (volume.value > 0) {
    volume.value = 0
  } else {
    volume.value = 0.5
  }
  if (audioRef.value) audioRef.value.volume = volume.value
}

// --- 拖拽逻辑 (兼容鼠标和触摸) ---
const isDragging = ref(false)

const startDrag = (type, event) => {
  // **关键修改**: 对于触摸事件，立即阻止默认行为，防止浏览器将其解释为滚动。
  if (event.touches) {
      event.preventDefault()
  }

  isDragging.value = true
  handleDrag(type, event) // 立即处理点击位置

  const moveHandler = (e) => handleDrag(type, e)
  const upHandler = () => {
    isDragging.value = false
    // 拖动结束后，如果是进度条，需要更新 audio 元素的 currentTime
    if (type === 'progress' && audioRef.value && duration.value) {
        audioRef.value.currentTime = currentTime.value;
    }

    window.removeEventListener('mousemove', moveHandler)
    window.removeEventListener('mouseup', upHandler)
    window.removeEventListener('touchmove', moveHandler)
    window.removeEventListener('touchend', upHandler)
  }

  window.addEventListener('mousemove', moveHandler)
  window.addEventListener('mouseup', upHandler)
  // 确保 touchmove 监听器是非 passive 的，允许调用 preventDefault
  window.addEventListener('touchmove', moveHandler, { passive: false })
  window.addEventListener('touchend', upHandler)
}

const handleDrag = (type, event) => {
  let clientX = event.clientX
  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX
    // 由于我们在 startDrag 中已经阻止了默认行为，这里可以保留（以防万一）或移除。
    // 为了兼容性和健壮性，这里保留，但在 startDrag 中阻止是最关键的。
    // event.preventDefault() // 移除此处的preventDefault，因为它在startDrag中已经处理
  }

  const el = type === 'progress' ? progressBarRef.value : volumeBarRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  let percentage = (clientX - rect.left) / rect.width
  percentage = Math.max(0, Math.min(1, percentage))

  if (type === 'progress') {
    if (duration.value) {
      // 拖动时仅更新 UI 状态的 currentTime
      currentTime.value = percentage * duration.value
    }
  } else if (type === 'volume') {
    volume.value = percentage
    if (audioRef.value) audioRef.value.volume = percentage
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' + s : s}`
}
</script>

<style scoped>
/* --- 主容器 --- */
.music-player-wrapper {
  position: fixed;
  top: 100px; 
  right: 20px;
  z-index: 2000;
  display: flex;
  align-items: center;
  background: var(--vp-c-bg-soft);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 45px; 
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 90px; 
  height: 90px; 
  padding: 5px; 
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), 
              border-radius 0.4s ease,
              background-color 0.3s ease;
  overflow: hidden;
}

/* 展开状态 */
.music-player-wrapper.is-expanded {
  width: 350px; 
  border-radius: 20px; 
  background: var(--vp-c-bg);
  padding-right: 15px; 
}

/* --- 1. 唱片区域 --- */
.disc-area {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  cursor: pointer;
  z-index: 2;
  transition: transform 0.4s ease;
}

/* 展开时唱片稍微左移一点，与其他元素拉开距离 */
.is-expanded .disc-area {
  margin-right: 15px;
}

/* SVG 环形进度条 */
.circular-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; 
  height: 100%; 
  pointer-events: none;
  transform: rotate(0deg);
  transition: opacity 0.3s;
  z-index: 1; 
}

/* 背景圆环使用更柔和的颜色，模拟轨道 */
.circular-progress circle:first-child {
  stroke: var(--vp-c-bg-soft);
}

.progress-ring {
  transition: stroke-dashoffset 0.1s linear;
}

/* 唱片旋转容器 */
.disc-rotate-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: spin 8s linear infinite;
  animation-play-state: paused;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 3; 
}

.disc-rotate-wrapper.is-spinning {
  animation-play-state: running;
}

.disc-cover {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  position: relative;
  border: 4px solid var(--vp-c-bg-soft); 
}

/* 唱片中间的孔 */
.disc-hole {
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

/* --- 2. 控制面板 (右侧区域) --- */
.controls-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly; 
  height: 100%;
  padding: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(10px);
  transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
  overflow: hidden;
  min-width: 0;
}

.is-expanded .controls-panel {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.panel-row {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 16px; 
}

/* 第一行：信息滚动 */
.info-row {
  height: 18px; 
  font-size: 13px;
  color: var(--vp-c-text-1);
  position: relative;
  /* 渐隐遮罩 */
  -webkit-mask-image: linear-gradient(to right, transparent 5%, black 15%, black 85%, transparent 95%);
  mask-image: linear-gradient(to right, transparent 5%, black 15%, black 85%, transparent 95%);
}

.scrolling-text-container {
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}

.scrolling-content {
  display: inline-block;
}

/* 滚动动画 */
.is-scrolling .scrolling-content {
  animation: scroll 12s linear infinite; 
}

.song-title {
  font-weight: bold;
}
.song-artist {
  color: var(--vp-c-text-2);
}
.spacer {
  margin-left: 30px; 
}

/* 第二行：进度条 */
.progress-row {
  height: 14px; 
  gap: 8px;
  justify-content: space-between; 
}

/* 优化时间提示样式 */
.time-hint {
  font-size: 10px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
  width: 70px; 
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
}

.time-hint .separator {
    margin: 0 2px;
}

/* 第三行：音量 */
.volume-row {
  height: 14px; 
  gap: 6px;
}
.volume-icon {
  color: var(--vp-c-text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* 通用自定义滑块样式 (进度条 & 音量条) */
.custom-slider-track {
  flex: 1;
  height: 4px; 
  background: var(--vp-c-divider);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  touch-action: none; 
}

/* 增加热区，方便点击 */
.custom-slider-track::after {
  content: '';
  position: absolute;
  top: -5px; bottom: -5px; left: 0; right: 0;
}

.slider-fill {
  height: 100%;
  background: var(--vp-c-brand);
  border-radius: 2px;
  pointer-events: none;
  box-shadow: 0 0 5px rgba(var(--vp-c-brand-rgb), 0.5);
}

/* 第四行：控制按钮 */
.buttons-row {
  justify-content: space-between;
  padding: 0 10px;
  min-height: 28px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
}

.btn-icon:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand);
}

/* 动画定义 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } 
}

/* 移动端适配 */
@media (max-width: 768px) {
  .music-player-wrapper {
    top: 80px; 
    right: 10px;
  }

  .music-player-wrapper.is-expanded {
    width: 280px; 
  }
}
</style>