# Trading Simulator 项目规则（Project Rules）

> 本文档结合现有代码（截至 2025-06）整理了整体架构、依赖层级、事件流及编码规范，供后续开发与重构参考。所有说明默认使用 **ES6 Modules** 与浏览器运行环境。

---

## 1. 目录结构与层级依赖

```
src/
  ├─ config/     # 常量 & 静态配置（纯 JSON/对象）
  ├─ utils/      # 无状态工具函数
  ├─ services/   # 业务状态 & 事件派发（不得直接操作 DOM）
  ├─ ui/         # 仅负责 DOM 渲染 & 事件绑定
  └─ main.js     # 应用入口，实例化 service & 装配 UI
styles/          # 样式资源
```

层级依赖由低到高：`config → utils → services → ui → main`。
* 低层 **禁止** 引用高层代码（如 service 绝不能 import ui）。
* UI 层可以调用 service 暴露的方法，但不得直接修改其内部状态对象。

---

## 2. 全局事件总线

服务层通过 `window.dispatchEvent(new CustomEvent(...))` 向全局派发事件，UI 层订阅并更新视图。目前内置事件一览：

| 事件名            | detail 结构 / 说明                           | 派发方                 |
|-------------------|----------------------------------------------|------------------------|
| `priceUpdate`     | `{ currentPrice, previousPrice, priceChange, priceChangePercent, timestamp }` | `MarketService`        |
| `positionsUpdate` | *无*                                         | `TradingEngine` / `AccountService` |
| `ordersUpdate`    | *无*                                         | `TradingEngine` / `AccountService` |
| `historyUpdate`   | *无*                                         | `AccountService`       |
| `accountRestart`  | *无*                                         | `AccountService.restart()` |
| `tradeCompleted`  | `closedTrade` 对象                           | `TradingEngine.closePosition()` |

> 若需新增事件，请先在 **services** 层设计并在表格中登记，保持命名统一的 *camelCase* 动词+名词 格式，例如：`newsUpdate`、`achievementUnlocked`。

---

## 3. 命名与编码规范

1. **文件命名**：小写 + `camelCase.js`，CSS 采用 `kebab-case.css`。
2. **类名**：`PascalCase`，函数/变量 `camelCase`，常量 `SCREAMING_SNAKE_CASE`。
3. **注释**：中文为主，必要时补充英文释义；关键算法使用 **JSDoc** 格式。
4. **格式化**：统一使用 `prettier` 默认风格（2 空格缩进，单引号）。
5. **DRY 原则**：遇到重复逻辑，优先提取到 `utils/` 或共享的 service 中。

---

## 4. Service 层通用约定

* 所有长周期逻辑需提供 `start()` / `stop()` 方法并在内部保存 `isRunning` 状态。
* 与时间速度相关的逻辑应通过依赖注入 `TimeService`，避免自行 `setInterval` 无视游戏速度。
* 派发事件时必须保证 **detail** 结构稳定，否则需要发版说明。
* Service 层禁止直接读取或修改 DOM。

---

## 5. UI 层通用约定

* DOM 查询应在 `init*` 函数内部完成，避免全局变量污染。
* UI 组件应返回必要的公开函数（如 `refresh()`）而非暴露内部节点。
* 仅监听 **事件总线** 或调用 Service API；不得持有 Service 的内部字段引用。

---

## 6. 功能扩展指引

1. **新增配置** → `src/config/` 新增文件并在 `main.js` 导入。
2. **新增工具函数** → `src/utils/`，保持无副作用纯函数。
3. **新增业务逻辑** → 在 `src/services/` 创建独立类，必要时注入现有服务。
4. **新增 UI 组件** → 在 `src/ui/` 创建文件，命名 `initXxx.js` 并在 `main.js` 装配。
5. **事件命名** → 遵循章节 2 规则，避免与现有事件冲突。

---

## 7. 测试与临时文件

* 所有测试文件放置于 `tests/` 或根目录临时文件，**使用后必须删除**，保持仓库整洁。
* 测试用 HTML（`test_*.html`）同样遵循"用后即删"原则。

---

## 8. 行为兼容与最小化修改

* 修改核心逻辑时，优先保证 **事件签名 & 数据结构** 不变。
* 若确需破坏性变更，必须在 PR 描述中列出迁移步骤，并提供向后兼容的适配层。

---

> 本规则文件与 `MODULARIZATION_RULES.md` 互补：`MODULARIZATION_RULES.md` 侧重目录/模块拆分原则；本 `RULES.md` 侧重现有实现细节与后续约束。两者同时生效。 