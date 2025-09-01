# Trading Simulator - 本地服务器启动指南

由于项目使用了ES6模块，无法直接通过双击HTML文件运行，需要通过本地HTTP服务器来访问。

## 快速启动（推荐）

### Windows用户
双击运行 `start-server.bat` 文件，选择合适的服务器选项。

### 手动启动方法

#### 方法1: Python 3 (推荐)
```bash
# 在项目根目录打开命令提示符或PowerShell
python -m http.server 8000
```

#### 方法2: Python 2 (备选)
```bash
python -m SimpleHTTPServer 8000
```

#### 方法3: Node.js
```bash
# 需要先安装Node.js
npx http-server -p 8000
```

#### 方法4: PHP (如果安装了PHP)
```bash
php -S localhost:8000
```

## 访问项目

启动服务器后，在浏览器中访问：
- **主页面**: http://localhost:8000/index-simple.html
- **测试页面**: 
  - http://localhost:8000/test_leverage.html
  - http://localhost:8000/test_market.html

## 停止服务器

在命令行窗口中按 `Ctrl + C` 停止服务器。

## 常见问题

### 端口被占用
如果8000端口被占用，可以使用其他端口：
```bash
python -m http.server 8080
# 然后访问 http://localhost:8080
```

### Python未安装
- 下载安装Python: https://www.python.org/downloads/
- 安装时勾选"Add Python to PATH"选项

### 模块加载失败
确保：
1. 使用HTTP服务器访问（不是file://协议）
2. 所有文件路径正确
3. 浏览器支持ES6模块（现代浏览器都支持）

## 项目结构

```
项目根目录/
├── index-simple.html     # 主入口文件
├── src/                  # 源代码目录
│   ├── config/          # 配置文件
│   ├── services/        # 业务服务
│   ├── ui/              # UI组件
│   └── utils/           # 工具函数
├── styles/              # 样式文件
└── start-server.bat     # 服务器启动脚本
``` 