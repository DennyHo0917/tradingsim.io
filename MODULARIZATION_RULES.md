## Trading Simulator 模块化重构规则

### 1. 目录结构
- `index.html`：精简后的入口页面，只负责加载静态资源。
- `src/`：全部业务源码（ES6 Modules）。
  - `config/`：配置与常量（如 `gameConfig.js`、`marketConfig.js`）。
  - `services/`：纯业务逻辑层（如 `marketService.js`、`achievementService.js`）。
  - `ui/`：仅负责 DOM 渲染与事件绑定（如 `chartView.js`、`tradingPanelView.js`）。
  - `utils/`：工具函数与通用方法（如 `format.js`、`eventBus.js`）。
  - `main.js`：应用入口，负责初始化与模块组装。
- `styles/`：所有样式资源。
  - `main.css`：公共样式。
  - `modules/`：组件级样式文件（BEM / SCSS 可选）。
- `assets/`：图片、图标、字体等静态文件。
- `tests/`：单元/集成测试（使用后删除）。

### 2. JavaScript 模块规范
1. **单一职责**：每个模块专注一个领域；禁止一个文件承载多种逻辑。
2. **ES6 导入导出**：统一使用 `export` / `import`；禁止在浏览器全局挂载变量。
3. **命名约定**：函数 & 变量使用 `camelCase`，类使用 `PascalCase`，常量全大写蛇形 `SNAKE_CASE`。
4. **禁止重复**：若多个模块需要相同逻辑，必须抽到 `utils/` 或共享 service 中。
5. **严格类型提示**：用 JSDoc 注释或引入 TypeScript（可选）。

### 3. 样式与 UI 规范
1. 所有样式移至外部 CSS / SCSS，禁止内联 `<style>`。
2. 组件级样式文件采用与组件同名方式存放于 `styles/modules/`。
3. 类名使用 `kebab-case`，并遵循 BEM；避免全局污染。
4. **响应式优先**：使用弹性布局 (Flex/Grid) 与媒体查询；禁止 JS 动态写死宽高。

### 4. HTML 规范
1. `index.html` 仅保留结构根节点和资源引用；大量模板拆分到 JS 模块中字符串模板或前端模板引擎。
2. 页面文本（面向终端用户）保持英语；开发注释使用中/英混合，但以英语为主。

### 5. 代码质量
- 引入 ESLint + Prettier，统一编码风格。
- 重要逻辑配套单元测试（Jest）。
- 所有提交通过 CI（可选 GitHub Actions）。

### 6. DRY & 最小化修改原则
- **增量重构**：一次一个功能块，保证核心功能始终可用。
- **兼容旧接口**：对外暴露 API 不骤然变动；若必须变更需提供 adapter 层。
- **严禁大规模重命名**：非必要不得随意修改变量、函数、文件名；如需更名，必须有迁移脚本或 codemod，且写在 PR 描述中。
- **保持行为不变**：重构前后需通过回归测试验证功能一致；测试不通过禁止合并。
- **消除重复（DRY）**：若发现重复逻辑，先抽象为公共模块，再在各处引用。

### 7. 语言沟通规则
- 网站面向欧美用户：页面文案保持 **English**。
- 与开发者沟通：继续使用 **中文**。

### 8. 临时文件与测试
- 所有测试用例、调试脚本使用后务必删除，保持代码库整洁。

### 9. 文档与注释
- 关键算法/流程需附 JSDoc & Markdown 说明。
- `README.md` 更新模块化流程与本规则。 