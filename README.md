# A / FORM — Independent Designer

英文概念作品集。使用 frontend-design 设计原则与 motion/react 动效，包含首页及四个项目详情页。不含真实客户、真实联系账号、后台或数据库。

## GitHub Pages

在线编辑器： https://miena1-a2.github.io/a-form-portfolio/studio/ 。安全登录与首次配置见 [EDITOR-SETUP.md](EDITOR-SETUP.md)。网站内容集中在 `app/site-content.json`，编辑器提交后触发同一发布流程。

发布地址：https://miena1-a2.github.io/a-form-portfolio/

仓库 Settings → Pages → Source 选择 GitHub Actions。推送 main 后自动测试、构建并发布。使用 `npm ci` 与 `npm run build:pages` 可在本地生成相同的 `out/` 静态文件。构建脚本为四个项目详情页生成独立 HTML 元数据，并提供 SPA 404 回退；生产站点基路径由 Vite 和 `app/paths.ts` 统一处理。

前端为纯 React + Vite 静态应用，不依赖 Next.js 或 Vinext。Cloudflare Worker 继续作为独立的登录、云草稿和发布 API，前端发布不会重新部署后端。

## 运行

需要 Node.js 22.13+，推荐 Node.js 24。

```powershell
npm install
npm run dev
```

打开 http://localhost:3001/ 。开发服务仅绑定本机 127.0.0.1，固定端口 3001；若端口占用，先关闭之前的本项目服务。Windows 已启用轮询监听，避免复制图片时文件监听锁冲突。

```powershell
npm run build
npx tsc --noEmit
npm run lint
node --test scripts/validate.mjs
```

## 内容与页面

- `app/data.ts`：身份、项目名称、职责、年份、描述和素材路径。
- `app/globals.css`：配色、网格、响应式排版。
- `app/hero.tsx`、`app/sculpture.tsx`：雕塑与降级逻辑。
- `app/ui.tsx`：图片放大过渡、返回位置、页脚时钟。
- `public/images/`：原创图片；`public/og.png`：分享封面。
- `public/images/hero-final.png` 是实际静态雕塑，采用纯黑背景和网页混合模式融入背景。生成器两次没有提供真实 alpha，因此未使用棋盘格草稿；最初草稿保存在 `source-assets/`。
- `ASSET-PROMPTS.md`：内置 imagegen 的生成提示词与素材说明。
- 详情地址：`/work/phase-matter`、`/work/tidal-index`、`/work/after-signal`、`/work/common-field`。

项目详情采用全幅图、70% 图与双列视觉三组展示。现阶段每个项目使用一张原创基础图及原生排版变体，不冒充真实客户交付。

## 行为

- 桌面 WebGL 雕塑最大指针旋转约 4°；离屏或页面不可见时暂停渲染。
- 小屏、粗指针、减少动态效果或 WebGL 不可用时使用静态图。
- Motion 控制文字显现、图片揭示、1.02 倍悬停和路由放大过渡。
- 返回作品按钮恢复上一浏览位置；浏览器返回交由路由/浏览器滚动恢复。
- 联系信息均明确为“SOON”，不链接虚构账号。
- 正文字体 Inter 本地打包，无外部字体请求。

## 验收状态与限制

构建、TypeScript、ESLint（0 错误，原生 img 的优化建议）和静态测试已检查。原生图片保留明确尺寸，非首屏延迟加载。

浏览器刷新后的自动化被浏览器安全策略拦截，未绕过限制。因此桌面/平板/手机截图、点击过渡、键盘焦点、返回位置、真实 WebGL 渲染、减少动态效果和实际帧率仍需浏览器人工验收；不要将静态检查视为这些交互已通过。

建议人工检查 1920×1080、1024×768、390×844、320×700：无非预期横向滚动，标题不截断，项目可访问，返回位置正确；用 Tab 检查链接与跳转内容；打开系统“减少动态效果”确认静态降级。

公开版本只有 Vite 生成的静态文件；后续更新依赖后应重新执行依赖审计。
