import type { App, Directive } from 'vue'

interface WatermarkOptions {
  text?: string
  fontSize?: number
  fontFamily?: string
  color?: string
  rotate?: number
  zIndex?: number
  opacity?: number
}

const defaultOptions: WatermarkOptions = {
  text: '水印文字',
  fontSize: 16,
  fontFamily: 'Arial',
  color: '#000000',
  rotate: -30,
  zIndex: 1000,
  opacity: 0.1
}

const createWatermark = (el: HTMLElement, options: WatermarkOptions) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布大小
  canvas.width = 300
  canvas.height = 200

  // 设置文字样式
  ctx.font = `${options.fontSize}px ${options.fontFamily}`
  ctx.fillStyle = options.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = options.opacity

  // 旋转文字
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((options.rotate * Math.PI) / 180)
  ctx.fillText(options.text, 0, 0)

  // 创建水印容器
  const watermarkDiv = document.createElement('div')
  watermarkDiv.style.position = 'absolute'
  watermarkDiv.style.top = '0'
  watermarkDiv.style.left = '0'
  watermarkDiv.style.width = '100%'
  watermarkDiv.style.height = '100%'
  watermarkDiv.style.pointerEvents = 'none'
  watermarkDiv.style.zIndex = options.zIndex.toString()
  watermarkDiv.style.backgroundImage = `url(${canvas.toDataURL()})`
  watermarkDiv.style.backgroundRepeat = 'repeat'

  // 添加到元素
  el.style.position = 'relative'
  el.appendChild(watermarkDiv)

  // 保存水印元素引用
  el._watermark = watermarkDiv
}

const removeWatermark = (el: HTMLElement) => {
  if (el._watermark) {
    el.removeChild(el._watermark)
    delete el._watermark
  }
}

const watermark: Directive = {
  mounted(el: HTMLElement, binding) {
    const options = { ...defaultOptions, ...binding.value }
    createWatermark(el, options)
  },
  updated(el: HTMLElement, binding) {
    removeWatermark(el)
    const options = { ...defaultOptions, ...binding.value }
    createWatermark(el, options)
  },
  unmounted(el: HTMLElement) {
    removeWatermark(el)
  }
}

export default {
  install(app: App) {
    app.directive('watermark', watermark)
  }
} 