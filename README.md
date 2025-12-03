# Booklook Frontend

## 项目简介

Booklook 前端项目 - 基于 React + Vite + TypeScript + Tailwind CSS 构建的 AI 服装视觉创作工具。

## 技术栈

- **框架**: React 18
- **构建工具**: Vite 5
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **路由**: React Router 6
- **状态管理**: Zustand（可选）

## 设计风格

- **主色**: #00E2C7（青绿色）
- **点缀色**: #FF2401（鲜橙色）
- **背景**: #111111（深黑）
- **风格**: 深色科技感 + 点阵背景 + 大留白

详见 `fronted_style_guide.md`

## 项目结构

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx              # 首页
│   │   └── Editor.tsx            # 编辑器页面
│   ├── components/
│   │   └── editor/
│   │       ├── ModeTabs.tsx      # 模式切换
│   │       ├── ControlPanel.tsx  # 控制面板（PC）
│   │       ├── PreviewPanel.tsx  # 预览面板（PC）
│   │       ├── MobilePreview.tsx # 移动端预览
│   │       ├── MobileControls.tsx # 移动端控制
│   │       └── UploadArea.tsx    # 上传组件
│   ├── App.tsx                   # 路由配置
│   ├── main.tsx                  # 入口文件
│   └── index.css                 # 全局样式
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 核心功能

### 首页 (/)

- Hero 区块展示
- 三大功能介绍（换头/换背景/换姿势）
- CTA 引导区
- 响应式布局

### 编辑器 (/editor)

#### 桌面端布局（≥1024px）
- **左侧**: 控制面板
  - 模式切换
  - 图片上传
  - 参数调整
  - 生成按钮
- **右侧**: 预览面板
  - 原图/结果对比
  - 下载按钮

#### 移动端布局（<1024px）
- **上部**: 预览区域
  - 原图展示
  - 结果展示
- **下部**: 操作区域
  - 快速上传
  - 可展开的高级设置
  - 固定底部生成按钮

## 响应式断点

```
- 手机: <768px
- 平板: 768-1024px
- 桌面: ≥1024px
```

## 主要组件说明

### ModeTabs

模式切换组件，支持三种模式：
- HEAD_SWAP（换头）
- BACKGROUND_CHANGE（换背景）
- POSE_CHANGE（换姿势）

### ControlPanel

桌面端左侧控制面板：
- 图片上传区域
- 模式相关参数设置
- 生成按钮
- 提示信息

### PreviewPanel

桌面端右侧预览面板：
- 原图/结果对比展示
- 处理进度显示
- 下载功能

### MobileControls

移动端操作面板：
- 快速上传按钮
- 可展开的高级设置
- 底部固定生成按钮

## 样式系统

### Tailwind 自定义配置

```javascript
colors: {
  primary: '#00E2C7',    // 主色
  accent: '#FF2401',     // 点缀色
  dark: {
    DEFAULT: '#111111',  // 主背景
    card: '#151515',     // 卡片背景
    border: '#2B2B2B',   // 边框
  },
  text: {
    primary: '#FFFFFF',   // 主文字
    secondary: '#BBBBBB', // 次文字
    tertiary: '#777777',  // 弱提示
  },
}
```

### 自定义类

- `.tech-grid-bg` - 科技感点阵背景
- `.btn-primary` - 主按钮
- `.btn-secondary` - 次按钮
- `.card` - 卡片样式
- `.input` - 输入框样式

## API 集成（待实现）

```typescript
// 示例：调用后端 API
const response = await fetch('/api/v1/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mode: 'HEAD_SWAP',
    source_image: sourceImageId,
    config: {
      reference_image: referenceImageId,
      quality: 'high',
    },
  }),
})
```

## 开发注意事项

1. **保持风格一致**: 遵循 `fronted_style_guide.md` 的设计规范
2. **响应式优先**: 确保所有页面在手机和桌面端都有良好体验
3. **类型安全**: 使用 TypeScript 类型定义
4. **组件复用**: 提取公共组件避免重复代码
5. **性能优化**: 图片懒加载、代码分割

## TODO

- [ ] 实现状态管理（Zustand）
- [ ] 对接后端 API
- [ ] 添加图片上传进度条
- [ ] 实现结果下载功能
- [ ] 添加任务历史记录
- [ ] 实现 WebSocket 实时进度
- [ ] 添加用户认证（可选）
- [ ] 优化移动端体验

## 许可证

MIT

