# SSQ Predict (双色球预测大师)

[![GitHub license](https://img.shields.io/github/license/your-username/ssq-predict)](https://github.com/your-username/ssq-predict/blob/main/LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![React Version](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://react.dev/)
[![Code Style: Black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

## 📖 项目简介

双色球预测与分析平台，基于现代人工智能技术与传统中华术数智慧相结合的创新型下一代双色球预测平台。我们通过深度学习算法分析历史数据，同时融合梅花易数、奇门遁甲等传统预测方法，为彩票爱好者提供多维度的分析工具和决策参考。

> ⚠️ **免责声明**：本项目仅供学习和研究使用，不构成任何投资建议。彩票有风险，购买需理性。

## ✨ 功能特性

### 🤖 智能预测
- **多种算法支持**：XGBoost、神经网络、马尔可夫链、线性回归、遗传算法等
- **算法组合**：支持多种算法组合预测，提高准确性
- **置信度评分**：为每个预测结果提供置信度参考

### 🔮 传统术数
- **梅花易数**：基于时间起卦的传统预测方法
- **奇门遁甲**：简化版日家奇门预测
- **六爻预测**：六爻起卦法
- **河洛数理**：河图洛书数理分析
- **时空预测**：结合时间与空间信息
- **八字分析**：基于生辰八字的五行分析

### 📊 数据分析
- **历史数据统计**：红球/蓝球频率统计
- **冷热号码分析**：识别热门和冷门号码
- **可视化图表**：使用 ECharts 和 Recharts 展示数据趋势
- **五行分布**：基于五行理论的号码分析

### 🔮 易经服务
- **卦象查询**：64 卦详细信息
- **爻辞解读**：各爻位解读
- **主题占卜**：事业、财运、感情等多主题解读

### 👥 用户功能
- **用户注册/登录**：完整的用户认证系统
- **预测历史**：保存用户的预测记录
- **个人资料**：用户信息管理

## 🏗️ 技术架构

### 前端 (Frontend)
- **核心框架**: React 18 + TypeScript + Vite
- **UI 组件**: TailwindCSS + Shadcn/UI
- **可视化**: ECharts + Recharts
- **状态管理**: Context API / Hooks
- **路由**: React Router v7
- **动画**: Framer Motion

### 后端 (Backend)
- **核心框架**: Python 3.12 + Django 6.0 + Django REST Framework
- **数据库**: SQLite 3 (内置)
- **缓存**: LocMemCache (开发) / Redis 7+ (生产)
- **任务调度**: Django-APScheduler
- **算法引擎**: XGBoost, 传统术数算法 (梅花/奇门/六爻/河洛/八字)
- **API 文档**: drf-spectacular (Swagger UI / ReDoc)

### 部署与运维
- **Web服务器**: Nginx + Gunicorn
- **代码质量**: pre-commit + Black + Flake8 + isort

## 🚀 快速开始

### 1. 环境要求
- **Python**: 3.12+
- **Node.js**: 18+
- **npm**: 9+

### 2. 克隆项目
```bash
git clone https://github.com/your-username/ssq-predict.git
cd ssq-predict
```

### 3. 后端设置
```bash
cd backend

# 创建虚拟环境 (推荐)
python -m venv venv
# Windows 激活
venv\Scripts\activate
# Linux/Mac 激活
# source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 数据库迁移
python manage.py migrate

# (可选) 初始化易经数据
python manage.py init_iching

# 启动 API 服务
python manage.py runserver 0.0.0.0:5081

# (可选) 启动定时任务调度器 (另开一个终端)
python manage.py run_scheduler
```

### 4. 前端设置
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 5. 访问地址
- **前端页面**: http://localhost:5080
- **后端 API**: http://localhost:5081
- **Swagger 文档**: http://localhost:5081/api/docs/
- **ReDoc 文档**: http://localhost:5081/api/redoc/

详细部署步骤请参考 [OPS_MANUAL.md](OPS_MANUAL.md)。

## ⚙️ 配置说明

### 后端配置
主要配置文件位于 `backend/config/settings.py`：

- **数据库配置**: 默认使用 SQLite，可配置 PostgreSQL/MySQL
- **缓存配置**: 默认使用 LocMemCache，生产环境建议使用 Redis
- **CORS 配置**: 开发环境允许所有来源，生产环境需配置白名单
- **日志配置**: 日志文件位于 `backend/logs/django.log`

### AI 配置
AI 相关配置位于 `backend/config/ai_config.yaml`：
- API Key（已加密存储）
- 模型版本
- 请求参数

## 🧪 测试与质量

### 后端测试
```bash
cd backend
pytest
# 生成覆盖率报告
pytest --cov=api
```

### 前端检查
```bash
cd frontend
# 代码检查
npm run lint
# 类型检查
npm run check
# 运行测试
npm run test
# 完整验证
npm run verify
```

### 代码格式化
项目使用 pre-commit 进行代码质量检查：
```bash
# 安装 pre-commit
pip install pre-commit
pre-commit install

# 手动运行所有检查
pre-commit run --all-files
```

## 📚 API 文档

项目集成了 `drf-spectacular`，启动服务后可访问：

- **Swagger UI**: `/api/docs/` - 交互式 API 文档
- **ReDoc**: `/api/redoc/` - 美观的 API 文档

主要 API 端点：
- `/api/auth/` - 用户认证
- `/api/predict/` - 预测服务
- `/api/traditional/` - 传统术数预测
- `/api/statistics/` - 数据统计
- `/api/gua/` - 易经卦象查询
- `/api/lottery-results/` - 历史开奖结果

## 📂 目录结构

```
ssq-predict/
├── backend/                 # Django 后端工程
│   ├── api/                 # 核心业务逻辑
│   │   ├── algorithms/      # 预测算法实现
│   │   ├── core/            # 核心工具和中间件
│   │   ├── management/      # Django 管理命令
│   │   ├── migrations/      # 数据库迁移文件
│   │   ├── services/        # 业务服务层
│   │   ├── tests/           # 后端测试
│   │   ├── admin.py         # 后台管理
│   │   ├── models.py        # 数据模型
│   │   ├── serializers.py   # API 序列化器
│   │   ├── urls.py          # API 路由
│   │   └── views.py         # API 视图
│   ├── config/              # 项目配置
│   │   ├── ai_config.yaml   # AI 配置
│   │   ├── prompts.yaml     # AI 提示词
│   │   ├── secure_config.py # 安全配置
│   │   ├── settings.py      # Django 设置
│   │   └── urls.py          # 主路由
│   ├── logs/                # 日志目录
│   ├── manage.py            # Django 管理脚本
│   ├── requirements.txt     # Python 依赖
│   └── pyproject.toml       # Black/isort 配置
├── frontend/                # React 前端工程
│   ├── public/              # 静态资源
│   ├── src/                 # 源代码
│   │   ├── api/             # API 调用
│   │   ├── components/      # React 组件
│   │   ├── context/         # Context 上下文
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── lib/             # 工具库
│   │   ├── pages/           # 页面组件
│   │   ├── App.tsx          # 根组件
│   │   └── main.tsx         # 入口文件
│   ├── .prettierrc          # Prettier 配置
│   ├── eslint.config.js     # ESLint 配置
│   ├── package.json         # npm 依赖
│   ├── tailwind.config.js   # Tailwind CSS 配置
│   ├── tsconfig.json        # TypeScript 配置
│   └── vite.config.ts       # Vite 配置
├── .gitignore               # Git 忽略文件
├── .pre-commit-config.yaml  # pre-commit 配置
├── README.md                # 项目说明
└── OPS_MANUAL.md            # 运维部署手册
```

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- **Python**: 遵循 [PEP 8](https://peps.python.org/pep-0008/)，使用 Black 格式化
- **TypeScript/JavaScript**: 遵循 ESLint 规则，使用 Prettier 格式化
- **提交信息**: 使用清晰的提交信息，说明变更内容

### 开发环境设置
请参考 [快速开始](#-快速开始) 章节设置开发环境，并确保：
1. 安装 pre-commit hooks
2. 运行测试确保一切正常
3. 提交前运行 `pre-commit run --all-files`

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🆘 常见问题

### 后端无法启动
- 检查 Python 版本是否为 3.12+
- 确认已安装所有依赖：`pip install -r requirements.txt`
- 检查端口 5081 是否被占用

### 前端无法启动
- 检查 Node.js 版本是否为 18+
- 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`
- 检查端口 5080 是否被占用

### 数据库相关
- 运行 `python manage.py migrate` 应用迁移
- 删除 `db.sqlite3` 后重新运行迁移可以重置数据库

更多问题请查看 [OPS_MANUAL.md](OPS_MANUAL.md) 中的常见问题排查章节。

## 📧 联系方式

- 项目地址: [https://github.com/your-username/ssq-predict](https://github.com/your-username/ssq-predict)
- 问题反馈: [Issues](https://github.com/your-username/ssq-predict/issues)

## 🙏 致谢

- 感谢所有为本项目做出贡献的开发者
- 感谢开源社区提供的优秀工具和库

---

**⚠️ 温馨提示**：彩票是一种概率游戏，预测结果仅供参考。请理性购彩，量力而行！
