<script setup lang="ts">
import type { MapEntry } from '../data/maps'

defineProps<{ map: MapEntry }>()
defineEmits<{ select: [map: MapEntry] }>()
</script>

<template>
  <button class="map-card" type="button" :aria-label="`查看地图：${map.name}`" @click="$emit('select', map)">
    <img class="map-card__image" :src="map.cover" :alt="`${map.name} 的封面`" loading="lazy" />
    <span class="map-card__footer">
      <span class="map-card__name">{{ map.name }}</span>
    </span>
  </button>
</template>
