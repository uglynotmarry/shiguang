# Cyber×Ghibli 底部图标设计说明

## 视觉风格
- 赛博元素：霓虹渐变（蓝紫）、外发光（Gaussian Blur）、抽象未来线条。
- 宫崎骏元素：柔和曲线、自然意象以“抽象符号”呈现（种子涟漪、树冠波、暖光球、人物轮廓）。
- 避免具象树形，使用抽象表达（seed spiral、canopy dots、glowing orb、soft profile）。

## 色彩与比例
- 主色：`#00D9FF`、`#6A5CFF`、`#B400FF`、点缀 `#7DD3C0`、`#FF79C6`。
- 图标画布：1:1，`viewBox 0 0 128 128`（严格正方形）。
- 文本：沿用参考图的字号与字距；在实现中使用应用既有标签文本样式，图标与文字间距对齐参考图像。

## 资产结构与状态
- 目录：`assets/icons/cyber-ghibli/`
- 每个图标均提供三态：`default` / `hover` / `active`（发光强度、线宽、对比度递进）。
- 文件清单：
  - treehole-*.svg（种子涟漪）
  - forest-*.svg（树冠波线）
  - soul-*.svg（暖光核心）
  - future-self-*.svg（抽象人物）
  - bottom-bg.svg（磨砂玻璃底栏，含粒子点）

## 背景处理
- 默认：半透明磨砂玻璃叠加深色渐变，细微粒子光点增强科技感。
- 备选：纯白底、科技蓝渐变（均可通过更换底图）。

## 技术规格
- SVG：矢量、内置渐变与发光滤镜；1x1比例，128×128 像素画布。
- PNG：使用 `scripts/export-icons.js` 批量从 SVG 导出 128×128。
- 等距水平排列：通过应用底栏容器使用 `space-around` 或固定间距布局。

## 导出PNG
1. 安装：`npm i sharp`
2. 执行：`node scripts/export-icons.js`
3. 输出：与 SVG 同目录生成 `.png` 文件（同名）。

## 交互态
- Default：柔光、细线；
- Hover：增强外发光、加粗线、对比提升；
- Active：加入半透明背板、最强发光、核心高亮。

## 集成建议（React Native）
- 使用 `Image` 组件加载 PNG；或引入 `react-native-svg` 直接加载 SVG。
- 文本标签沿用参考图字号与字距，图标与文字间距使用固定 6–8dp，整体等距排布。