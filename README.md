# 考古探险游戏 - 项目文档索引

## 📋 核心文档

### 🚀 部署相关
- **DEPLOYMENT_GUIDE.md** - 完整部署指南
- **PBFORTUNE_HTTP_ONLY_CONFIG.md** - pbfortune.ca域名HTTP配置
- **WEBHOOK_PROTECTION_CONFIG.md** - Webhook保护配置确认

### 🔧 开发相关
- **DEVELOPMENT_LOG.md** - 开发过程记录
- **EMAIL_SETUP_GUIDE.md** - 邮箱服务配置
- **TROUBLESHOOTING_LOG.md** - 故障排查记录

## 🎯 当前状态

- ✅ Docker镜像已准备: `archaeological-explorer-final.tar`
- ✅ 简单静态服务器: `simple-server.js`
- ✅ 容器化配置: `Dockerfile`
- ✅ 域名配置方案: pbfortune.ca
- ✅ Webhook保护: 确保不影响现有服务

## 🌐 部署架构

```
IP访问:    http://47.93.179.39/webhook/  → Webhook服务 (3000端口)
域名访问:  http://pbfortune.ca           → 考古游戏 (3001端口)
```

## 📦 关键文件

- `archaeological-explorer-final.tar` - 生产就绪的Docker镜像
- `simple-server.js` - 简化的静态文件服务器
- `Dockerfile` - Docker构建配置
- `.dockerignore` - Docker构建忽略文件

---
*项目状态: 准备部署*  
*最后更新: 2024-10-07*