<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MapCard from './components/MapCard.vue'
import MapViewer from './components/MapViewer.vue'
import { categories, maps, type MapEntry } from './data/maps'

const activeCategoryId = ref<string | 'all'>('all')
const selectedMapId = ref<string | null>(null)

const guideMap: MapEntry = {
  id: 'guide',
  name: '看图须知',
  categoryId: 'guide',
  cover: '/guide.webp',
  layers: [{ id: 'guide', label: '看图须知', image: '/guide.webp' }],
}

const visibleMaps = computed(() => {
  if (activeCategoryId.value === 'all') return maps
  return maps.filter((map) => map.categoryId === activeCategoryId.value)
})

const selectedMap = computed(() => maps.find((map) => map.id === selectedMapId.value) ?? (selectedMapId.value === guideMap.id ? guideMap : null))
const groupedMaps = computed(() =>
  categories
    .map((category) => ({
      category,
      maps: maps.filter((map) => map.categoryId === category.id),
    }))
    .filter((group) => group.maps.length > 0),
)

function selectCategory(categoryId: string | 'all') {
  activeCategoryId.value = categoryId
}

function openMap(map: MapEntry) {
  selectedMapId.value = map.id
}

function closeViewer() {
  selectedMapId.value = null
}

function openGuide() {
  selectedMapId.value = guideMap.id
}

watch(selectedMapId, (value) => {
  document.body.classList.toggle('is-viewer-open', Boolean(value))
})
</script>

<template>
  <main class="app-shell">
    <section class="catalogue" aria-label="地图分类图库">
      <div class="category-list" role="tablist" aria-label="地图分类">
        <button
          class="category-button"
          :class="{ 'category-button--active': activeCategoryId === 'all' }"
          type="button"
          role="tab"
          :aria-selected="activeCategoryId === 'all'"
          @click="selectCategory('all')"
        >
          <span aria-hidden="true">▦</span> 全部 <small>{{ maps.length }}</small>
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-button"
          :class="{ 'category-button--active': activeCategoryId === category.id }"
          type="button"
          role="tab"
          :aria-selected="activeCategoryId === category.id"
          @click="selectCategory(category.id)"
        >
          {{ category.name }} <small>{{ maps.filter((map) => map.categoryId === category.id).length }}</small>
        </button>
      </div>

      <div v-if="activeCategoryId === 'all'" class="map-groups">
        <section v-for="(group, index) in groupedMaps" :key="group.category.id" class="map-group">
          <div class="map-group__heading">
            <h3>{{ group.category.name }}</h3>
            <span>{{ group.maps.length }} 张</span>
            <button v-if="index === 0" class="guide-button" type="button" @click="openGuide">看图须知 ↗</button>
          </div>
          <div class="map-grid">
            <MapCard v-for="map in group.maps" :key="map.id" :map="map" @select="openMap" />
          </div>
        </section>
      </div>

      <div v-else-if="visibleMaps.length">
        <div class="filtered-toolbar">
          <button class="guide-button" type="button" @click="openGuide">看图须知 ↗</button>
        </div>
        <div class="map-grid map-grid--filtered">
          <MapCard v-for="map in visibleMaps" :key="map.id" :map="map" @select="openMap" />
        </div>
      </div>

      <p v-else class="empty-state">这个分类暂时还没有地图。</p>
    </section>

    <Teleport to="body">
      <MapViewer
        v-if="selectedMap"
        :map="selectedMap"
        @close="closeViewer"
      />
    </Teleport>
  </main>
</template>
