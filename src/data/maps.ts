export type MapLayer = {
  id: string
  label: string
  image: string
}

export type MapEntry = {
  id: string
  name: string
  categoryId: string
  cover: string
  layers: MapLayer[]
}

export type MapCategory = {
  id: string
  name: string
}

export const categories: MapCategory[] = [
  { id: 'dot-dot-red', name: '点点红' },
  { id: 'dot-red', name: '点红' },
  { id: 'dot-arc-dot-red', name: '点弧点红' },
  { id: 'dot-arc-red', name: '点弧红' },
  { id: 'horizontal-dot-red', name: '横点红' },
  { id: 'arc-red', name: '弧红' },
  { id: 'arc-vertical-red', name: '弧竖红' },
]

function layers(directory: string, extension = 'png'): MapLayer[] {
  return [
    { id: 'b1', label: 'B1', image: `/maps/${directory}/B1.${extension}` },
    { id: 'b2', label: 'B2', image: `/maps/${directory}/B2.${extension}` },
    { id: 'b3', label: 'B3', image: `/maps/${directory}/B3.${extension}` },
  ]
}

function map(categoryId: string, categoryName: string, number: number, extension = 'png'): MapEntry {
  const directory = `${categoryId}-${number}`

  return {
    id: directory,
    name: `${categoryName} ${number}`,
    categoryId,
    cover: `/maps/${directory}/cover.png`,
    layers: layers(directory, extension),
  }
}

function singleMap(categoryId: string, categoryName: string, extension = 'png'): MapEntry {
  return {
    id: categoryId,
    name: categoryName,
    categoryId,
    cover: `/maps/${categoryId}/cover.png`,
    layers: layers(categoryId, extension),
  }
}

export const maps: MapEntry[] = [
  map('dot-dot-red', '点点红', 1),
  map('dot-dot-red', '点点红', 2),
  map('dot-red', '点红', 1),
  map('dot-red', '点红', 2),
  map('dot-red', '点红', 3),
  singleMap('dot-arc-dot-red', '点弧点红'),
  map('dot-arc-red', '点弧红', 1),
  map('dot-arc-red', '点弧红', 2),
  map('dot-arc-red', '点弧红', 3),
  map('dot-arc-red', '点弧红', 4),
  singleMap('horizontal-dot-red', '横点红'),
  map('arc-red', '弧红', 1),
  map('arc-red', '弧红', 2),
  map('arc-red', '弧红', 3, 'jpg'),
  singleMap('arc-vertical-red', '弧竖红'),
]
