# 时光邮局 / Shiguang

一个包含多子项目的演示与实验代码仓库：

- `web-soul-dashboard`：基于 React + Vite 的前端演示，展示“灵魂星球”交互与统一发布模态（文字/语音）
- `ghibli-social-app`：移动端实验项目（含 Android WebView 演示与脚本）
- `weilai`：Android/Kotlin 项目与 Supabase 迁移脚本

## 快速开始（Web 前端）

1. 进入 `web-soul-dashboard` 目录
2. 安装依赖：`npm install`
3. 开发预览：`npm run dev`，访问 `http://localhost:5173/`
4. 构建产物：`npm run build`
5. 本地预览构建包：`npm run preview`

## 前端特性（web-soul-dashboard）

- 3D 球面分布视觉（仿），节点随透视缩放与层次模糊
- 文案与球体对齐：相对球体中心水平居中，垂直位于球体正下方
- 统一发布模态：支持文字发布（富文本可切换）与语音发布（麦克风录制 + 波形可视化）

入口结构：

- `src/main.tsx` → `src/App.tsx` → `src/components/SoulPlanet.tsx` → `src/components/UnifiedPublishModal.tsx`

## 数据库与脚本

- `weilai/supabase/migrations/20231114_create_users_table.sql`：示例迁移

## 测试与验证

- 当前未包含单元测试与集成测试用例，已在本地通过构建与运行验证
- 如需接入测试框架（Vitest / Jest），可在 `web-soul-dashboard` 增加依赖并补充测试文件

## 构建与部署

- Web 通过 `Vite` 构建；可将 `web-soul-dashboard/dist` 产物部署到任意静态托管（如 Vercel、Netlify、Nginx）
- 项目包含 `vercel.json`（在 `ghibli-social-app` 下）供示例参考

## 版本控制与清理

- 已对 `web-soul-dashboard` 初始化独立 Git 并记录清理前后提交
- 清理报告位于 `docs/cleanup-report-web-soul-dashboard.md`

## 安全

- 仓库不包含敏感密钥或 `.env`；发布与录音仅为演示，未接后端

## 目录导航

- 根目录下的 `docs/real-device-demo.md`：真机演示流程（Android / iOS）
- 其它文档与脚本位于各子项目目录。

