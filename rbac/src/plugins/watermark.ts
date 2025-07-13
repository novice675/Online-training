import type { App, Directive, DirectiveBinding } from 'vue'
import type { WatermarkOptions } from '../types/interfaces/watermark';

const defaultOptions: WatermarkOptions = {
  text: '自定义水印',
  fontSize: 16,
  fontFamily: 'Arial',
  color: '#000000',
  rotate: -30,
  zIndex: 1000,
  opacity: 0.1
}

interface WatermarkHTMLElement extends HTMLElement {
  _watermarkDiv?: HTMLDivElement;
  _watermarkOptionsStr?: string;
  _originalPosition?: string;
}

function getOptionsStr(options: WatermarkOptions): string {
  return JSON.stringify(options);
}

function createWatermarkDiv(options: WatermarkOptions): HTMLDivElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 200;
  if (!ctx) return document.createElement('div');

  const fontSize = options.fontSize ?? defaultOptions.fontSize!;
  const fontFamily = options.fontFamily ?? defaultOptions.fontFamily!;
  const color = options.color ?? defaultOptions.color!;
  const opacity = options.opacity ?? defaultOptions.opacity!;
  const rotate = options.rotate ?? defaultOptions.rotate!;
  const text = options.text ?? defaultOptions.text!;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = opacity;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.fillText(text, 0, 0);

  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100%';
  div.style.height = '100%';
  div.style.pointerEvents = 'none';
  div.style.zIndex = String(options.zIndex ?? defaultOptions.zIndex!);
  div.style.backgroundImage = `url(${canvas.toDataURL()})`;
  div.style.backgroundRepeat = 'repeat';
  return div;
}

function applyWatermark(el: WatermarkHTMLElement, options: WatermarkOptions) {
  const optionsStr = getOptionsStr(options);
  if (el._watermarkOptionsStr === optionsStr) return; // 没有变化不处理
  removeWatermark(el);

  // 只在 position 为 static 时设置为 relative
  const computedStyle = window.getComputedStyle(el);
  if (computedStyle.position === 'static') {
    el._originalPosition = el.style.position;
    el.style.position = 'relative';
  }

  const watermarkDiv = createWatermarkDiv(options);
  el.appendChild(watermarkDiv);
  el._watermarkDiv = watermarkDiv;
  el._watermarkOptionsStr = optionsStr;
}

function removeWatermark(el: WatermarkHTMLElement) {
  if (el._watermarkDiv) {
    el.removeChild(el._watermarkDiv);
    el._watermarkDiv = undefined;
    el._watermarkOptionsStr = undefined;
    // 恢复原有 position
    if (el._originalPosition !== undefined) {
      el.style.position = el._originalPosition;
      el._originalPosition = undefined;
    }
  }
}

const watermark: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    applyWatermark(el as WatermarkHTMLElement, { ...defaultOptions, ...binding.value });
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    applyWatermark(el as WatermarkHTMLElement, { ...defaultOptions, ...binding.value });
  },
  unmounted(el: HTMLElement) {
    removeWatermark(el as WatermarkHTMLElement);
  }
}

export default {
  install(app: App) {
    app.directive('watermark', watermark);
  }
} 