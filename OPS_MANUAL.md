# 运维手册 ( Ops Manual )

## 文档信息

| 项目 | 内容 |
|------|------|
| 项目名称 | SSQ Predict (双色球预测大师) |
| 文档版本 | v1.0 |
| 最后更新 | 2026-03-29 |
| 维护者 | 开发团队 |

## 目录

1. [系统启动](#1-系统启动)
2. [环境要求](#2-环境要求)
3. [开发环境部署](#3-开发环境部署)
4. [生产环境部署](#4-生产环境部署)
5. [配置说明](#5-配置说明)
6. [API 文档](#6-api-文档)
7. [日志管理](#7-日志管理)
8. [系统监控](#8-系统监控)
9. [备份与恢复](#9-备份与恢复)
10. [常见问题排查](#10-常见问题排查)
11. [运维操作指南](#11-运维操作指南)
12. [安全建议](#12-安全建议)

---

## 1. 系统启动

### 1.1 快速启动（开发环境）

#### 后端启动
```bash
cd backend

# 1. 创建虚拟环境（推荐）
python -m venv venv

# 2. 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 数据库迁移
python manage.py migrate

# 5. (可选) 初始化易经数据
python manage.py init_iching

# 6. 启动 API 服务
python manage.py runserver 0.0.0.0:5081

# 7. (可选) 启动定时任务调度器（另开一个终端）
python manage.py run_scheduler
```

#### 前端启动
```bash
cd frontend

# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

### 1.2 访问地址

启动成功后，可以通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | http://localhost:5080 | React 应用 |
| 后端 API | http://localhost:5081 | Django REST API |
| Swagger UI | http://localhost:5081/api/docs/ | 交互式 API 文档 |
| ReDoc | http://localhost:5081/api/redoc/ | 美观的 API 文档 |
| Django Admin | http://localhost:5081/admin/ | 后台管理（需创建超级用户） |

---

## 2. 环境要求

### 2.1 软件环境

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Python | 3.10 | 3.12+ | 后端运行环境 |
| Node.js | 16.x | 18+ | 前端构建环境 |
| npm | 8.x | 9+ | 包管理器 |
| SQLite | 3.x | 3.35+ | 数据库（开发环境） |
| Redis | - | 7+ | 缓存（生产环境推荐） |

### 2.2 硬件要求

#### 开发环境
| 资源 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2 核 | 4 核+ |
| 内存 | 4 GB | 8 GB+ |
| 磁盘 | 10 GB | 20 GB+ |

#### 生产环境
| 资源 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 4 核 | 8 核+ |
| 内存 | 8 GB | 16 GB+ |
| 磁盘 | 50 GB | 100 GB+ |

### 2.3 网络要求

- 开放端口：5080（前端）、5081（后端）
- 出站访问：如需 AI 服务，需访问外部 API
- 带宽：根据用户量调整，建议 10 Mbps+

---

## 3. 开发环境部署

### 3.1 完整部署步骤

#### 步骤 1：克隆代码
```bash
git clone https://github.com/chendok/ssq-predict.git
cd ssq-predict
```

#### 步骤 2：后端配置
```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量（可选）
# 复制 .env.example 为 .env 并修改
# cp .env.example .env

# 数据库迁移
python manage.py migrate

# 创建超级用户（可选，用于访问 Django Admin）
python manage.py createsuperuser

# 初始化易经数据（可选）
python manage.py init_iching
```

#### 步骤 3：前端配置
```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量（可选）
# 复制 .env.example 为 .env.local 并修改
# cp .env.example .env.local
```

#### 步骤 4：启动服务
```bash
# 终端 1：启动后端
cd backend
venv\Scripts\activate
python manage.py runserver 0.0.0.0:5081

# 终端 2：启动前端
cd frontend
npm run dev
```

### 3.2 开发工具配置

#### pre-commit 配置
```bash
# 安装 pre-commit
pip install pre-commit

# 安装 git hooks
pre-commit install

# 手动运行所有检查
pre-commit run --all-files
```

#### 代码格式化
```bash
# 后端 Python 代码格式化
cd backend
black .
isort .
flake8 .

# 前端代码格式化
cd frontend
npm run lint
npm run check
```

---

## 4. 生产环境部署

### 4.1 前端部署（静态站点）

#### 步骤 1：构建前端
```bash
cd frontend
npm install
npm run build
```

构建产物位于 `frontend/dist/` 目录。

#### 步骤 2：使用 Nginx 部署

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /var/www/ssq-frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # 前端路由支持（React Router）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:5081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 步骤 3：使用 CDN 部署（可选）

也可以使用 Vercel、Netlify、AWS S3 + CloudFront 等托管服务：

**Vercel 部署：**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### 4.2 后端部署

#### 方案 A：Gunicorn + Nginx

##### 步骤 1：安装系统依赖
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3-pip python3-venv nginx supervisor

# CentOS/RHEL
sudo yum install -y python3-pip python3-venv nginx supervisor
```

##### 步骤 2：设置后端
```bash
cd /var/www
git clone https://github.com/chendok/ssq-predict.git
cd ssq-predict/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 数据库迁移
python manage.py migrate

# 收集静态文件
python manage.py collectstatic --noinput

# 创建日志目录
mkdir -p logs
```

##### 步骤 3：配置 Gunicorn

创建 `gunicorn_config.py`：
```python
import multiprocessing

bind = "127.0.0.1:5081"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 60
keepalive = 5
preload_app = True
daemon = False

accesslog = "/var/www/ssq-predict/backend/logs/gunicorn-access.log"
errorlog = "/var/www/ssq-predict/backend/logs/gunicorn-error.log"
loglevel = "info"
```

##### 步骤 4：配置 Supervisor

创建 `/etc/supervisor/conf.d/ssq-backend.conf`：
```ini
[program:ssq-backend]
directory=/var/www/ssq-predict/backend
command=/var/www/ssq-predict/backend/venv/bin/gunicorn config.wsgi:application -c gunicorn_config.py
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/www/ssq-predict/backend/logs/supervisor.log
environment=LANG=en_US.UTF-8,LC_ALL=en_US.UTF-8
```

启动服务：
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ssq-backend
```

##### 步骤 5：配置 Nginx

创建 `/etc/nginx/sites-available/ssq-backend`：
```nginx
upstream django_backend {
    server 127.0.0.1:5081;
}

server {
    listen 80;
    server_name api.your-domain.com;

    client_max_body_size 10M;

    location /static/ {
        alias /var/www/ssq-predict/backend/static/;
        expires 30d;
    }

    location /media/ {
        alias /var/www/ssq-predict/backend/media/;
        expires 30d;
    }

    location / {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/ssq-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 方案 B：使用 Docker（推荐）

创建 `docker-compose.yml`：
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5081:5081"
    environment:
      - DEBUG=False
      - ALLOWED_HOSTS=*
    volumes:
      - ./backend/db.sqlite3:/app/db.sqlite3
      - ./backend/logs:/app/logs
    depends_on:
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5080:80"
    depends_on:
      - backend
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

启动：
```bash
docker-compose up -d
```

### 4.3 HTTPS 配置（必须）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 5. 配置说明

### 5.1 后端配置（settings.py）

#### 核心配置项

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `DEBUG` | `True` | 调试模式，生产环境必须设为 `False` |
| `SECRET_KEY` | 随机生成 | 密钥，生产环境必须使用强密钥 |
| `ALLOWED_HOSTS` | `["*"]` | 允许的主机名，生产环境需明确指定 |
| `DATABASES` | SQLite | 数据库配置 |
| `CACHES` | LocMemCache | 缓存配置 |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | CORS 配置，生产环境需设白名单 |
| `TIME_ZONE` | `UTC` | 时区设置，建议设为 `Asia/Shanghai` |
| `SERVER_PORT` | `5081` | 服务端口 |

#### 生产环境配置示例

```python
# 生产环境安全配置
DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'your-production-secret-key')
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# 数据库配置（使用 PostgreSQL）
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'ssq_predict'),
        'USER': os.environ.get('DB_USER', 'ssq_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'password'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Redis 缓存配置
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# CORS 配置
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'https://your-domain.com',
    'https://www.your-domain.com',
]

# 安全配置
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
```

### 5.2 前端配置

创建 `frontend/.env.production`：
```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_TITLE=双色球预测大师
```

### 5.3 AI 配置

AI 配置位于 `backend/config/ai_config.yaml`：

```yaml
api_key: encrypted-api-key
base_url: https://api.deepseek.com/v1
max_tokens: 2048
model_version: deepseek-chat
temperature: 0.7
```

重新加密 API Key：
```bash
cd backend
python -c "from config.secure_config import secure_config; print(secure_config.encrypt_value('your-api-key'))"
```

---

## 6. API 文档

### 6.1 在线文档

启动服务后访问：

- **Swagger UI**: http://localhost:5081/api/docs/
  - 交互式 API 测试
  - 自动生成的文档
  - 支持在线调试

- **ReDoc**: http://localhost:5081/api/redoc/
  - 美观的文档界面
  - 适合阅读

### 6.2 主要 API 端点

#### 认证相关
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register/` | POST | 用户注册 |
| `/api/auth/login/` | POST | 用户登录 |
| `/api/auth/user/` | GET | 获取当前用户信息 |

#### 预测相关
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/predict/` | POST | AI 预测 |
| `/api/traditional/predict/` | POST | 传统术数预测 |
| `/api/prediction-history/` | GET | 预测历史 |

#### 统计相关
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/statistics/` | GET | 数据统计 |
| `/api/lottery-results/` | GET | 历史开奖结果 |

#### 易经相关
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/gua/{name}/` | GET | 卦象详情 |
| `/api/gua/{name}/yao/{position}/` | GET | 爻辞详情 |
| `/api/divination/` | POST | 主题占卜 |

#### 传统术数
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/divination/gods-sha/yearly/` | GET | 年神煞 |
| `/api/divination/gods-sha/noble/` | GET | 贵人星 |

---

## 7. 日志管理

### 7.1 日志位置

| 日志类型 | 路径 | 说明 |
|---------|------|------|
| Django 应用日志 | `backend/logs/django.log` | 应用运行日志 |
| Gunicorn 访问日志 | `backend/logs/gunicorn-access.log` | HTTP 访问日志 |
| Gunicorn 错误日志 | `backend/logs/gunicorn-error.log` | Gunicorn 错误日志 |
| Supervisor 日志 | `backend/logs/supervisor.log` | 进程管理日志 |
| Nginx 访问日志 | `/var/log/nginx/access.log` | Nginx 访问日志 |
| Nginx 错误日志 | `/var/log/nginx/error.log` | Nginx 错误日志 |

### 7.2 日志格式

Django 日志格式：
```
LEVEL TIME MODULE [RequestID: xxx] MESSAGE
```

示例：
```
INFO 2026-03-29 10:30:00,123 views [RequestID: abc123] Prediction request received
ERROR 2026-03-29 10:30:01,456 ai_service [RequestID: abc123] API request failed
```

### 7.3 日志轮转

日志已配置自动轮转（10MB，保留 5 个备份）。

手动查看日志：
```bash
# 实时查看日志
tail -f backend/logs/django.log

# 搜索错误
grep ERROR backend/logs/django.log

# 统计错误数量
grep ERROR backend/logs/django.log | wc -l
```

### 7.4 日志清理

定期清理旧日志：
```bash
# 删除 30 天前的日志
find backend/logs -name "*.log.*" -mtime +30 -delete

# 或使用 logrotate
```

---

## 8. 系统监控

### 8.1 健康检查

#### 后端健康检查
```bash
# 检查服务是否运行
curl http://localhost:5081/api/docs/

# 或使用自定义健康检查端点
# 需要在项目中实现
```

#### 进程监控
```bash
# 检查 Django 进程
ps aux | grep runserver

# 检查 Gunicorn 进程
ps aux | grep gunicorn

# Supervisor 状态
sudo supervisorctl status
```

### 8.2 资源监控

#### CPU/内存监控
```bash
# 实时监控
top
htop

# 查看进程资源占用
ps aux --sort=-%mem | head
```

#### 磁盘监控
```bash
# 查看磁盘使用
df -h

# 查看目录大小
du -sh backend/logs/
```

### 8.3 数据库监控

```bash
# 进入 Django shell
cd backend
python manage.py shell

# 查询记录数
from api.models import LotteryResult, PredictionHistory
print(f"Lottery results: {LotteryResult.objects.count()}")
print(f"Predictions: {PredictionHistory.objects.count()}")
```

### 8.4 告警配置（推荐）

使用简单的监控脚本：

```bash
#!/bin/bash
# monitor.sh

BACKEND_URL="http://localhost:5081/api/docs/"
LOG_FILE="/var/log/ssq-monitor.log"

check_backend() {
    if curl -s "$BACKEND_URL" > /dev/null; then
        echo "$(date): Backend is OK" >> "$LOG_FILE"
    else
        echo "$(date): Backend is DOWN!" >> "$LOG_FILE"
        # 发送告警邮件或重启服务
        sudo supervisorctl restart ssq-backend
    fi
}

check_backend
```

添加到 crontab：
```bash
# 每 5 分钟检查一次
*/5 * * * * /path/to/monitor.sh
```

---

## 9. 备份与恢复

### 9.1 数据库备份

#### SQLite 备份
```bash
# 备份数据库
cp backend/db.sqlite3 backups/db-$(date +%Y%m%d-%H%M%S).sqlite3

# 或使用 Django 命令
cd backend
python manage.py dumpdata > backups/data-$(date +%Y%m%d).json
```

#### PostgreSQL 备份（如果使用）
```bash
# 备份
pg_dump ssq_predict > backups/db-$(date +%Y%m%d).sql

# 恢复
psql ssq_predict < backups/db-20260329.sql
```

### 9.2 文件备份

```bash
# 备份整个项目
tar -czf backups/ssq-predict-$(date +%Y%m%d).tar.gz \
    --exclude='node_modules' \
    --exclude='venv' \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    ssq-predict/
```

### 9.3 自动备份脚本

创建 `backup.sh`：
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
PROJECT_DIR="/var/www/ssq-predict"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# 备份数据库
cp "$PROJECT_DIR/backend/db.sqlite3" "$BACKUP_DIR/db-$DATE.sqlite3"

# 备份配置文件
cp "$PROJECT_DIR/backend/config/ai_config.yaml" "$BACKUP_DIR/"

# 删除 7 天前的备份
find "$BACKUP_DIR" -name "db-*.sqlite3" -mtime +7 -delete

echo "Backup completed: $DATE"
```

添加到 crontab：
```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

### 9.4 数据恢复

```bash
# 恢复数据库
cp backups/db-20260329.sqlite3 backend/db.sqlite3

# 恢复 JSON 数据
cd backend
python manage.py loaddata backups/data-20260329.json

# 运行迁移（如果需要）
python manage.py migrate
```

---

## 10. 常见问题排查

### 10.1 后端相关问题

#### Q: 后端无法启动，提示端口被占用
**A:**
```bash
# 查找占用端口的进程
netstat -ano | findstr :5081  # Windows
lsof -i :5081                  # Linux/Mac

# 结束进程
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                   # Linux/Mac

# 或使用其他端口
python manage.py runserver 0.0.0.0:5082
```

#### Q: ModuleNotFoundError: No module named 'xxx'
**A:**
```bash
# 确保虚拟环境已激活
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 重新安装依赖
pip install -r requirements.txt
```

#### Q: 数据库迁移错误
**A:**
```bash
# 尝试回滚迁移
python manage.py migrate api zero

# 重新应用迁移
python manage.py migrate

# 如果还是不行，删除数据库重新开始（仅开发环境）
rm backend/db.sqlite3
python manage.py migrate
```

#### Q: AI 服务无法调用
**A:**
1. 检查 API Key 是否正确配置
2. 检查网络连接
3. 查看日志：`tail -f backend/logs/django.log`
4. 确认 `tenacity` 已安装

### 10.2 前端相关问题

#### Q: 前端无法启动，提示 node_modules 错误
**A:**
```bash
cd frontend

# 删除依赖并重新安装
rm -rf node_modules package-lock.json
npm install

# 清除 npm 缓存
npm cache clean --force
```

#### Q: 前端 API 请求失败
**A:**
1. 检查后端是否正常运行
2. 检查 API 地址配置（`.env` 文件）
3. 检查浏览器控制台的网络请求
4. 确认 CORS 配置正确

#### Q: 构建失败
**A:**
```bash
cd frontend

# 运行类型检查
npm run check

# 运行 lint 检查
npm run lint

# 修复 lint 错误
npm run lint -- --fix
```

### 10.3 部署相关问题

#### Q: Nginx 502 Bad Gateway
**A:**
1. 检查后端服务是否运行
2. 检查 Gunicorn 日志
3. 检查 Nginx 配置中的 proxy_pass 地址
4. 查看 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`

#### Q: 静态资源 404
**A:**
1. 确认已运行 `python manage.py collectstatic`
2. 检查 Nginx 配置中的静态文件路径
3. 检查文件权限

#### Q: HTTPS 不工作
**A:**
1. 检查证书是否有效
2. 检查 Nginx 配置
3. 检查防火墙是否开放 443 端口
4. 运行 `sudo certbot renew` 续期

### 10.4 性能问题

#### Q: 响应慢
**A:**
1. 启用 Redis 缓存
2. 检查数据库索引
3. 增加 Gunicorn worker 数量
4. 启用 Nginx 缓存

#### Q: 内存占用高
**A:**
1. 检查是否有内存泄漏
2. 减少 Gunicorn worker 数量
3. 限制日志大小
4. 使用更轻量的缓存

---

## 11. 运维操作指南

### 11.1 数据管理

#### 创建超级用户
```bash
cd backend
python manage.py createsuperuser
```

#### 手动更新彩票数据
```bash
cd backend
python manage.py scrape_ssq
```

#### 清空预测历史
```bash
cd backend
python manage.py shell
```
```python
from api.models import PredictionHistory
PredictionHistory.objects.all().delete()
```

### 11.2 服务管理

#### 使用 Supervisor
```bash
# 查看状态
sudo supervisorctl status

# 启动服务
sudo supervisorctl start ssq-backend

# 停止服务
sudo supervisorctl stop ssq-backend

# 重启服务
sudo supervisorctl restart ssq-backend

# 查看日志
sudo supervisorctl tail ssq-backend
```

#### 使用 systemd（备选）

创建 `/etc/systemd/system/ssq-backend.service`：
```ini
[Unit]
Description=SSQ Predict Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ssq-predict/backend
Environment="PATH=/var/www/ssq-predict/backend/venv/bin"
ExecStart=/var/www/ssq-predict/backend/venv/bin/gunicorn config.wsgi:application -c gunicorn_config.py
Restart=always

[Install]
WantedBy=multi-user.target
```

管理服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable ssq-backend
sudo systemctl start ssq-backend
sudo systemctl status ssq-backend
```

### 11.3 更新部署

#### 零停机更新流程
```bash
# 1. 拉取最新代码
cd /var/www/ssq-predict
git pull origin main

# 2. 备份数据库
cp backend/db.sqlite3 backups/db-$(date +%Y%m%d-%H%M%S).sqlite3

# 3. 更新后端依赖
cd backend
source venv/bin/activate
pip install -r requirements.txt

# 4. 运行数据库迁移
python manage.py migrate

# 5. 收集静态文件
python manage.py collectstatic --noinput

# 6. 重启服务
sudo supervisorctl restart ssq-backend

# 7. 更新前端
cd ../frontend
npm install
npm run build

# 8. 验证
curl http://localhost:5081/api/docs/
```

### 11.4 定时任务

#### Django-APScheduler
项目已集成定时任务，管理命令：

```bash
# 启动调度器（前台运行）
python manage.py run_scheduler

# 在后台运行（使用 supervisor 或 nohup）
nohup python manage.py run_scheduler > logs/scheduler.log 2>&1 &
```

#### 系统 Cron 任务

添加到 `/etc/crontab`：
```bash
# 每天凌晨 3 点更新彩票数据
0 3 * * * www-data cd /var/www/ssq-predict/backend && /var/www/ssq-predict/backend/venv/bin/python manage.py scrape_ssq >> /var/log/ssq-cron.log 2>&1

# 每周日凌晨 4 点清理旧日志
0 4 * * 0 www-data find /var/www/ssq-predict/backend/logs -name "*.log.*" -mtime +30 -delete
```

---

## 12. 安全建议

### 12.1 生产环境安全检查清单

- [ ] `DEBUG` 设置为 `False`
- [ ] 使用强 `SECRET_KEY`
- [ ] 配置明确的 `ALLOWED_HOSTS`
- [ ] 启用 HTTPS
- [ ] 配置安全的 Cookie 设置
- [ ] 配置 CORS 白名单
- [ ] 定期更新依赖包
- [ ] 配置防火墙规则
- [ ] 设置文件权限正确
- [ ] 启用日志监控
- [ ] 定期备份数据
- [ ] 禁止目录列表
- [ ] 隐藏服务器版本信息

### 12.2 依赖安全

定期检查依赖漏洞：
```bash
# Python 依赖
cd backend
pip install safety
safety check

# 或使用 pip-audit
pip install pip-audit
pip-audit

# 前端依赖
cd frontend
npm audit
npm audit fix
```

### 12.3 文件权限

```bash
# 设置正确的权限
cd /var/www/ssq-predict

# 目录权限
find . -type d -exec chmod 750 {} \;

# 文件权限
find . -type f -exec chmod 640 {} \;

# 可执行脚本
chmod +x backend/manage.py

# 日志目录可写
chmod 770 backend/logs/

# 设置所有者
sudo chown -R www-data:www-data /var/www/ssq-predict
```

### 12.4 敏感信息

确保敏感信息不提交到 Git：

```bash
# 检查 .gitignore 是否包含
# .env
# .secret.key
# ai_config.yaml (或加密其中的敏感信息)
# db.sqlite3
```

### 12.5 网络安全

```bash
# 配置防火墙（UFW 示例）
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 只允许特定 IP 访问管理后台
# 在 Nginx 配置中添加
# location /admin/ {
#     allow 192.168.1.0/24;
#     deny all;
#     ...
# }
```

---

## 附录

### A. 有用的命令速查

```bash
# 后端
cd backend
python manage.py runserver 0.0.0.0:5081  # 启动开发服务器
python manage.py shell                      # Django Shell
python manage.py dbshell                    # 数据库 Shell
python manage.py migrate                    # 运行迁移
python manage.py createsuperuser            # 创建超级用户
python manage.py collectstatic              # 收集静态文件

# 前端
cd frontend
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run lint        # 代码检查
npm run test        # 运行测试

# 日志
tail -f backend/logs/django.log              # 实时查看日志
grep ERROR backend/logs/django.log           # 搜索错误

# 进程
ps aux | grep python                          # 查看 Python 进程
sudo supervisorctl status                     # Supervisor 状态
```

### B. 参考文档

- [Django 文档](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

### C. 联系方式

- 项目地址: [https://github.com/chendok/ssq-predict](https://github.com/chendok/ssq-predict)
- 问题反馈: [Issues](https://github.com/chendok/ssq-predict/issues)

---

**文档结束**

如有问题，请查看 [常见问题排查](#10-常见问题排查) 或提交 Issue。
