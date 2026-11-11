<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MapEntry } from '../data/maps'

const props = defineProps<{
  map: MapEntry
}>()

const emit = defineEmits<{
  close: []
}>()

const activeLayerId = ref(props.map.layers[0]?.id ?? '')
const rotation = ref(0)
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const activeLayer = computed(() => props.map.layers.find((layer) => layer.id === activeLayerId.value) ?? props.map.layers[0])
const mapStyle = computed(() => ({ transform: `translate(${pan.value.x}px, ${pan.value.y}px) rotate(${rotation.value}deg) scale(${zoom.value})` }))
const canSwitchLayers = computed(() => props.map.layers.length > 1)
const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`)

const pointers = new Map<number, { x: number; y: number }>()
let dragOrigin: { pointerId: number; x: number; y: number; panX: number; panY: number } | null = null
let pinchStartDistance = 0
let pinchStartZoom = 1

function preloadLayers() {
  props.map.layers.forEach((layer) => {
    const image = new Image()
    image.src = layer.image
  })
}

watch(
  () => props.map.id,
  () => {
    activeLayerId.value = props.map.layers[0]?.id ?? ''
    rotation.value = 0
    resetView()
    preloadLayers()
  },
  { immediate: true },
)

function resetView() {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}

function setActiveLayer(layerId: string) {
  activeLayerId.value = layerId
  resetView()
}

function moveLayer(direction: 1 | -1) {
  const layers = props.map.layers
  if (!layers.length) return

  const activeIndex = Math.max(layers.findIndex((layer) => layer.id === activeLayerId.value), 0)
  setActiveLayer(layers[(activeIndex + direction + layers.length) % layers.length].id)
}

function rotateMap() {
  rotation.value = (rotation.value + 180) % 360
}

function setZoom(value: number) {
  zoom.value = Math.min(3, Math.max(1, value))
  if (zoom.value === 1) pan.value = { x: 0, y: 0 }
}

function zoomBy(amount: number) {
  setZoom(zoom.value + amount)
}

function onWheel(event: WheelEvent) {
  zoomBy(event.deltaY < 0 ? 0.2 : -0.2)
}

function distanceBetweenPointers() {
  const points = [...pointers.values()]
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
}

function onPointerDown(event: PointerEvent) {
  event.preventDefault()
  const canvas = event.currentTarget as HTMLElement
  canvas.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 2) {
    pinchStartDistance = distanceBetweenPointers()
    pinchStartZoom = zoom.value
    dragOrigin = null
  } else if (zoom.value > 1) {
    dragOrigin = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: pan.value.x, panY: pan.value.y }
  }
}

function onPointerMove(event: PointerEvent) {
  if (!pointers.has(event.pointerId)) return
  event.preventDefault()
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 2 && pinchStartDistance > 0) {
    setZoom(pinchStartZoom * (distanceBetweenPointers() / pinchStartDistance))
    return
  }

  if (dragOrigin?.pointerId === event.pointerId) {
    pan.value = {
      x: dragOrigin.panX + event.clientX - dragOrigin.x,
      y: dragOrigin.panY + event.clientY - dragOrigin.y,
    }
  }
}

function onPointerEnd(event: PointerEvent) {
  pointers.delete(event.pointerId)
  if (dragOrigin?.pointerId === event.pointerId) dragOrigin = null
  if (pointers.size < 2) pinchStartDistance = 0
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
  if (event.key === 'ArrowLeft') moveLayer(-1)
  if (event.key === 'ArrowRight') moveLayer(1)
  if (event.key.toLowerCase() === 'r') rotateMap()
  if (event.key === '+' || event.key === '=') zoomBy(0.2)
  if (event.key === '-') zoomBy(-0.2)
  if (event.key === '0') resetView()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="viewer" :class="{ 'viewer--single': !canSwitchLayers }" role="dialog" aria-modal="true" :aria-label="`${map.name} 地图查看器`">
    <header class="viewer__header">
      <div>
        <p class="viewer__eyebrow">地图查看器</p>
        <h2>{{ map.name }}</h2>
      </div>
      <button class="icon-button" type="button" aria-label="关闭地图查看器" @click="emit('close')"></button>
    </header>

    <nav v-if="canSwitchLayers" class="layer-tabs" aria-label="地图图层">
      <div class="layer-tabs__scroll">
        <button
          v-for="layer in map.layers"
          :key="layer.id"
          class="layer-tab"
          :class="{ 'layer-tab--active': activeLayer?.id === layer.id }"
          type="button"
          @click="setActiveLayer(layer.id)"
        >
          {{ layer.label }}
        </button>
      </div>
    </nav>

    <div class="viewer__stage">
      <button v-if="canSwitchLayers" class="viewer-side viewer-side--previous" type="button" aria-label="上一楼层" @click="moveLayer(-1)">←</button>
      <div
        class="viewer__canvas"
        :class="{ 'viewer__canvas--zoomed': zoom > 1 }"
        @wheel.prevent="onWheel"
        @pointerdown.prevent="onPointerDown"
        @pointermove.prevent="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
      >
        <img
          v-if="activeLayer"
          :key="`${map.id}-${activeLayer.id}`"
          class="viewer__map"
          :class="{ 'viewer__map--single': !canSwitchLayers }"
          :style="mapStyle"
          :src="activeLayer.image"
          :alt="`${map.name}：${activeLayer.label}`"
          draggable="false"
          @dragstart.prevent
        />
      </div>
      <button v-if="canSwitchLayers" class="viewer-side viewer-side--next" type="button" aria-label="下一楼层" @click="moveLayer(1)">→</button>
      <div class="viewer-controls" aria-label="图片查看控制">
        <button class="viewer-control" type="button" aria-label="放大地图" @click="zoomBy(0.2)">+</button>
        <button class="viewer-control viewer-control--label" type="button" aria-label="重置缩放和位置" @click="resetView">{{ zoomLabel }}</button>
        <button class="viewer-control" type="button" aria-label="缩小地图" @click="zoomBy(-0.2)">−</button>
        <button v-if="canSwitchLayers" class="viewer-control" type="button" aria-label="旋转地图 180 度" @click="rotateMap">↻</button>
      </div>
    </div>

    <p class="viewer__tip">滚轮或双指缩放，拖动查看；← → 切换楼层，R 旋转，Esc 关闭</p>
  </section>
</template>
