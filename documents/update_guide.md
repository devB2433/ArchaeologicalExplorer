# 服务器更新部署指南 | Server Update Deployment Guide

## 📋 概述 | Overview

本文档说明如何将本地开发的代码更新部署到生产服务器。

This document explains how to deploy locally developed code updates to the production server.

---

## 🔄 更新流程 | Update Process

### 步骤 1: 本地代码提交 | Step 1: Local Code Commit

```bash
# 进入项目目录
cd c:\Data\projects\FLL_creation\archaeology-game

# 查看修改内容
git status

# 添加所有修改
git add .

# 提交修改（使用有意义的提交信息）
git commit -m "描述你的修改内容"

# 推送到远程仓库
git push origin main
```

**提交信息示例 | Commit Message Examples:**
- `feat: 添加新的遗迹配置`
- `fix: 修复登录框高度问题`
- `refactor: 优化邮件服务配置`
- `docs: 更新配置文档`

---

### 步骤 2: 服务器更新 | Step 2: Server Update

#### 2.1 SSH 登录服务器 | SSH to Server

```bash
ssh root@147.93.184.68
# 或使用你的服务器用户名
```

#### 2.2 拉取最新代码 | Pull Latest Code

```bash
# 进入项目目录
cd /opt/archaeology-game

# 拉取最新代码
git pull origin main
```

**预期输出 | Expected Output:**
```
remote: Enumerating objects: X, done.
remote: Counting objects: 100% (X/X), done.
...
Updating abc123..def456
Fast-forward
 src/pages/AuthPage.jsx | 27 +++---
 src/pages/AuthPage.css |  2 +-
 2 files changed, 3 insertions(+), 26 deletions(-)
```

#### 2.3 重新部署 | Redeploy

```bash
# 执行部署脚本
./deploy.sh
```

**部署脚本会自动完成 | Deployment Script Auto-completes:**
1. ✅ 检查/创建数据卷
2. ✅ 构建新的 Docker 镜像（包含最新代码）
3. ✅ 停止旧容器
4. ✅ 启动新容器
5. ✅ 运行健康检查
6. ✅ 清理旧镜像

**预计耗时 | Estimated Time:** 1-2 分钟

---

### 步骤 3: 验证部署 | Step 3: Verify Deployment

#### 3.1 检查容器状态 | Check Container Status

```bash
docker ps
```

**预期输出 | Expected Output:**
```
CONTAINER ID   IMAGE                    STATUS                    PORTS                    NAMES
abc123def456   archaeology-game:latest  Up X minutes (healthy)    127.0.0.1:3001->3001/tcp archaeology-game-app
```

#### 3.2 查看日志 | View Logs

```bash
# 查看最新日志
docker logs archaeology-game-app

# 实时查看日志（按 Ctrl+C 退出）
docker logs -f archaeology-game-app
```

**健康日志示例 | Healthy Log Example:**
```
✅ Email service initialized with SMTP credentials
📧 Using service: hostinger
🔌 SMTP Config: { host: 'smtp.hostinger.com', port: 465, secure: true }
Server running on port 3001
```

#### 3.3 测试本地访问 | Test Local Access

```bash
# 测试 HTTP 响应
curl -I http://127.0.0.1:3001/

# 应该返回 HTTP 200
```

#### 3.4 测试外网访问 | Test Public Access

在浏览器访问 | Access in browser:
```
https://ancientecho.ca
```

**验证清单 | Verification Checklist:**
- [ ] 网站正常加载
- [ ] HTTPS 证书有效（显示 🔒 小锁）
- [ ] 新功能正常工作
- [ ] 图片资源正常显示
- [ ] 注册/登录功能正常
- [ ] API 请求正常

---

## 🛠️ 常见问题 | Troubleshooting

### 问题 1: Git 拉取失败 | Issue 1: Git Pull Failed

**症状 | Symptom:**
```
error: Your local changes to the following files would be overwritten by merge
```

**解决方案 | Solution:**
```bash
# 查看冲突文件
git status

# 选项 A: 保留服务器修改（不推荐）
git stash
git pull origin main

# 选项 B: 放弃服务器修改（推荐）
git reset --hard origin/main
git pull origin main
```

---

### 问题 2: 容器启动失败 | Issue 2: Container Failed to Start

**症状 | Symptom:**
```
[ERROR] Container failed to start
```

**解决方案 | Solution:**
```bash
# 查看详细错误日志
docker logs archaeology-game-app

# 常见原因:
# 1. .env 文件配置错误 → 检查环境变量
# 2. 端口被占用 → 检查 3001 端口
# 3. 镜像构建失败 → 重新构建镜像
```

---

### 问题 3: 网站无法访问 | Issue 3: Website Not Accessible

**检查步骤 | Debugging Steps:**

```bash
# 1. 检查容器是否运行
docker ps | grep archaeology

# 2. 检查端口监听
netstat -tulpn | grep 3001

# 3. 测试本地访问
curl http://127.0.0.1:3001/

# 4. 检查 SafeLine WAF 配置
# 登录 SafeLine 管理界面确认站点配置
```

---

### 问题 4: 邮件服务不工作 | Issue 4: Email Service Not Working

**检查配置 | Check Configuration:**

```bash
# 查看 .env 文件
cat .env | grep EMAIL

# 确保配置正确:
EMAIL_SERVICE=hostinger
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
EMAIL_USER=hello@pokemonrangers.com
EMAIL_PASS="你的密码"  # 注意引号包裹
```

**重启容器使配置生效 | Restart Container:**
```bash
docker restart archaeology-game-app
```

---

## 📦 更新类型说明 | Update Types

### 代码修改 | Code Changes
- 修改 `.js`, `.jsx`, `.css` 文件
- **需要**: 重新构建镜像（`./deploy.sh`）

### 配置文件修改 | Config File Changes
- 修改 `items.json`, `ruins.json` 等配置
- **需要**: 重新构建镜像（`./deploy.sh`）

### 图片资源添加 | Image Resources
- 添加新图片到 `public/assets/images/`
- **需要**: 重新构建镜像（`./deploy.sh`）

### 环境变量修改 | Environment Variables
- 修改 `.env` 文件
- **不需要**重新构建，只需重启容器:
  ```bash
  docker restart archaeology-game-app
  ```

---

## 🔐 安全注意事项 | Security Notes

1. **不要提交敏感信息到 Git**
   - `.env` 文件已被 `.gitignore` 忽略
   - 密码、密钥等敏感信息仅存储在服务器

2. **定期备份数据**
   ```bash
   # 在服务器上执行
   cd /opt/archaeology-game
   ./backup.sh
   ```

3. **定期更新系统**
   ```bash
   # 更新 Docker 镜像
   docker pull node:18-alpine
   
   # 重新构建应用镜像
   ./deploy.sh
   ```

---

## 📞 快速命令参考 | Quick Command Reference

```bash
# === 容器管理 | Container Management ===
docker ps                              # 查看运行中的容器
docker logs archaeology-game-app       # 查看日志
docker logs -f archaeology-game-app    # 实时日志
docker restart archaeology-game-app    # 重启容器
docker stop archaeology-game-app       # 停止容器
docker start archaeology-game-app      # 启动容器

# === 数据管理 | Data Management ===
./backup.sh                            # 备份数据
./restore.sh <backup-file>             # 恢复数据
docker volume ls                       # 查看数据卷

# === 部署 | Deployment ===
cd /opt/archaeology-game               # 进入项目目录
git pull origin main                   # 拉取最新代码
./deploy.sh                            # 重新部署

# === 监控 | Monitoring ===
docker stats archaeology-game-app      # 查看资源使用
docker inspect archaeology-game-app    # 查看容器详情
```

---

## 📝 更新日志 | Update Log

建议在每次更新后记录：

**日期 | Date:** YYYY-MM-DD  
**版本 | Version:** v0.x.x  
**修改内容 | Changes:**
- 功能 1
- 修复 2
- 优化 3

**部署时间 | Deployment Time:** X 分钟  
**状态 | Status:** ✅ 成功 / ❌ 失败  

---

## 🎯 最佳实践 | Best Practices

1. **在本地测试后再部署**
   ```bash
   # 本地 Docker 测试
   npm run build
   docker build -t archaeology-game:test .
   docker run -d -p 3001:3001 archaeology-game:test
   ```

2. **使用有意义的提交信息**
   - 遵循约定式提交规范
   - 便于追踪历史修改

3. **部署前备份数据**
   ```bash
   ./backup.sh
   ```

4. **分步骤验证**
   - 先验证容器启动
   - 再验证本地访问
   - 最后验证外网访问

5. **保持文档同步**
   - 修改配置后更新对应文档
   - 记录重要变更

---

**如有问题，请检查日志或联系开发团队！**

**For issues, please check logs or contact the development team!**
