# 地图图库

Vue 3 + Vite 的纯前端地图分类图库，可部署到腾讯云 EdgeOne Pages。

## 本地运行

PowerShell 请使用：

```powershell
npm.cmd install
npm.cmd run dev
```

构建生产文件：

```powershell
npm.cmd run build
```

输出目录是 `dist`。

## 维护地图内容

已接入 7 个分类、15 张地图。图片位于 `public/maps/`，分类和地图清单位于 `src/data/maps.ts`。

新增地图时：

1. 在 `public/maps/` 创建 `{分类-id}-{编号}` 目录；
2. 放入 `cover.png`、`B1.png`、`B2.png`、`B3.png`（也支持 jpg）；
3. 在 `src/data/maps.ts` 的 `maps` 数组末尾增加一条 `map(...)`。

示例：

```ts
{
  id: 'map-a',
  name: '弯道 + 房 1-1',
  categoryId: 'bend-room',
  cover: '/maps/bend-room-1-cover.webp',
  layers: [
    { id: 'b1', label: 'B1', image: '/maps/bend-room-1/B1.webp' },
    { id: 'b2', label: 'B2', image: '/maps/bend-room-1/B2.webp' },
    { id: 'b3', label: 'B3', image: '/maps/bend-room-1/B3.webp' },
  ],
}
```

## EdgeOne Pages

- 构建命令：`npm run build`
- 输出目录：`dist`
- Node.js：20 或更高版本

仓库远程地址：`https://github.com/chen-le-802/my-idv-jysj.git`。
