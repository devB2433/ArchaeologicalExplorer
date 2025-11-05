# Route Configuration Guide | 探索路线配置指南

## Overview | 概述

This document explains the exploration route system in the Archaeological Explorer game. Routes define how item combinations and total weight determine exploration methods and difficulty levels.

本文档说明考古探险游戏中的探索路线系统。路线定义了物品组合和总权重如何决定探索方式和难度等级。

---

## 1. Core Concepts | 核心概念

### Route Philosophy | 路线设计哲学

**Routes define "HOW to explore", not "WHAT to discover"**

**路线定义"如何探索"，而非"发现什么"**

- ✅ Routes match based on **total weight only**
- ✅ 路线仅基于**总权重**匹配

- ❌ Routes do NOT tie to specific countries
- ❌ 路线不关联特定国家

- ❌ Routes do NOT define discovery pools
- ❌ 路线不定义发现池

### Three-Tier Difficulty System | 三级难度系统

| Difficulty Level | Weight Range | Unlocked Ruins | Player Level Required |
|------------------|--------------|----------------|----------------------|
| **Beginner** 新手 | 1-20 | 5 beginner ruins | Lv1+ (3 item slots) |
| **Advanced** 进阶 | 15-50 | +3 advanced ruins | Lv3+ (4-5 item slots) |
| **Master** 大师 | 40-999 | +2 master ruins (hidden) | Lv5+ (6+ item slots) |

---

## 2. Route Configuration Structure | 路线配置结构

### JSON Schema | JSON 结构

```json
{
  "routeId": "beginner_exploration",
  "routeName": "Beginner Exploration",
  "routeDescription": "Basic surface exploration suitable for newcomers",
  "routeDifficulty": "beginner",
  "triggerConditions": {
    "minWeight": 1,
    "maxWeight": 20
  },
  "routePriority": 1,
  "isEnabled": true
}
```

### Field Descriptions | 字段说明

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `routeId` | string | ✅ | Unique route identifier<br>路线唯一标识符 |
| `routeName` | string | ✅ | Display name<br>显示名称 |
| `routeDescription` | string | ✅ | Route description<br>路线描述 |
| `routeDifficulty` | string | ✅ | Difficulty level: `beginner` / `advanced` / `master`<br>难度等级 |
| `triggerConditions` | object | ✅ | Trigger conditions<br>触发条件 |
| `triggerConditions.minWeight` | number | ✅ | Minimum total weight required<br>最低总权重要求 |
| `triggerConditions.maxWeight` | number | ✅ | Maximum total weight allowed<br>最大总权重限制 |
| `routePriority` | number | ✅ | Matching priority (1=highest)<br>匹配优先级（1最高） |
| `isEnabled` | boolean | ✅ | Whether route is active<br>是否启用 |

### Removed Fields | 已移除字段

❌ **No longer used:**
- `targetSiteId` - Routes are NOT tied to countries
- `discoveryPool` / `ruinsPool` - Discovery is determined by ruins configuration
- `requiredItems` - Players can carry ANY items, only weight matters
- `optionalItems` - Not needed in pure weight-based system
- `excludedItems` - Simplified to weight-only matching
- `specialRequirements` - Removed for simplicity

❌ **不再使用：**
- `targetSiteId` - 路线不再关联国家
- `discoveryPool` / `ruinsPool` - 发现由遗迹配置决定
- `requiredItems` - 玩家可携带任意物品，只看权重
- `optionalItems` - 纯权重系统不需要
- `excludedItems` - 简化为仅权重匹配
- `specialRequirements` - 为简化而移除

---

## 3. Current Routes | 当前路线配置

### Route 1: Beginner Exploration | 新手探索

```json
{
  "routeId": "beginner_exploration",
  "routeName": "Beginner Exploration",
  "routeDescription": "Basic surface exploration suitable for newcomers",
  "routeDifficulty": "beginner",
  "triggerConditions": {
    "minWeight": 1,
    "maxWeight": 20
  },
  "routePriority": 1,
  "isEnabled": true
}
```

**Characteristics | 特点:**
- 🎯 Target audience: Level 1-2 players (3 item slots)
- 🎯 目标用户：1-2级玩家（3个物品槽）

- 💡 Typical loadout: 3 items × ~3 weight = 9 total
- 💡 典型配置：3个物品 × ~3权重 = 9总权重

- 🏛️ Discoverable ruins: Valley of Kings, Giza Pyramids, Terracotta Warriors, Great Wall, Theatre of Dionysus
- 🏛️ 可发现遗迹：帝王谷、吉萨金字塔、兵马俑、长城、狄俄尼索斯剧场

---

### Route 2: Advanced Exploration | 进阶探索

```json
{
  "routeId": "advanced_exploration",
  "routeName": "Advanced Exploration",
  "routeDescription": "Deeper excavation requiring moderate equipment",
  "routeDifficulty": "advanced",
  "triggerConditions": {
    "minWeight": 15,
    "maxWeight": 50
  },
  "routePriority": 2,
  "isEnabled": true
}
```

**Characteristics | 特点:**
- 🎯 Target audience: Level 3-4 players (4-5 item slots)
- 🎯 目标用户：3-4级玩家（4-5个物品槽）

- 💡 Typical loadout: 4-5 items × ~5 weight = 20-25 total
- 💡 典型配置：4-5个物品 × ~5权重 = 20-25总权重

- 🏛️ Discoverable ruins: All beginner ruins + Karnak Temple, Forbidden City, Mycenae
- 🏛️ 可发现遗迹：所有新手遗迹 + 卡纳克神庙、紫禁城、迈锡尼

---

### Route 3: Master Exploration | 大师探索

```json
{
  "routeId": "master_exploration",
  "routeName": "Master Exploration",
  "routeDescription": "Ultimate exploration for expert archaeologists with comprehensive equipment",
  "routeDifficulty": "master",
  "triggerConditions": {
    "minWeight": 40,
    "maxWeight": 999
  },
  "routePriority": 3,
  "isEnabled": true
}
```

**Characteristics | 特点:**
- 🎯 Target audience: Level 5+ players (6+ item slots)
- 🎯 目标用户：5级以上玩家（6+个物品槽）

- 💡 Typical loadout: 6+ items including legendaries = 40-60 total
- 💡 典型配置：6+个物品（包含传说装备）= 40-60总权重

- 🏛️ Discoverable ruins: ALL ruins including hidden ones (Great Sphinx 25%, Sanxingdui 20%)
- 🏛️ 可发现遗迹：所有遗迹，包括隐藏遗迹（狮身人面像25%，三星堆20%）

- 🌟 Maximum possible weight: 59 (all 15 items unlocked by Lv5)
- 🌟 最大可能权重：59（5级解锁的全部15个物品）

---

## 4. Route Matching Logic | 路线匹配逻辑

### Matching Algorithm | 匹配算法

```javascript
// Pseudo-code
function matchRoute(totalWeight) {
  // 1. Filter routes by weight range
  const eligibleRoutes = routes.filter(route => 
    totalWeight >= route.minWeight && 
    totalWeight <= route.maxWeight &&
    route.isEnabled
  )
  
  // 2. Select highest priority route
  const selectedRoute = eligibleRoutes.sort(
    (a, b) => a.routePriority - b.routePriority
  )[0]
  
  // 3. Return route difficulty
  return selectedRoute?.routeDifficulty || 'beginner'
}
```

### Matching Examples | 匹配示例

| Total Weight | Matched Route | Difficulty | Example Loadout |
|--------------|---------------|------------|-----------------|
| **5** | Beginner | beginner | Camera(1) + Bucket(2) + Shovel(2) |
| **18** | Advanced | advanced | 4 items averaging 4.5 weight |
| **45** | Master | master | 6 items including LiDAR(10) + GPR(10) |
| **25** | Advanced | advanced | Falls in overlap zone (15-50) |

### Weight Range Overlap | 权重区间重叠

**Intentional Overlap Design:**

**有意的重叠设计：**

- Beginner: 1-20
- Advanced: 15-50 ⬅️ Overlaps with Beginner
- Master: 40-999 ⬅️ Overlaps with Advanced

**Why overlap? | 为何重叠？**

✅ Provides flexibility for player choice
✅ 为玩家选择提供灵活性

✅ High-priority routes are matched first
✅ 高优先级路线优先匹配

✅ Players at transition levels (15-20, 40-50) experience smooth progression
✅ 处于过渡等级的玩家（15-20，40-50）体验平滑进阶

---

## 5. Interaction with Ruins | 与遗迹的交互

### Discovery Process | 发现流程

```
1. Player selects items → Calculate total weight
   玩家选择物品 → 计算总权重

2. Match route based on weight → Get route difficulty
   基于权重匹配路线 → 获得路线难度

3. Filter ruins by difficulty → ruins.requiredDifficulty <= route.routeDifficulty
   根据难度过滤遗迹 → ruins.requiredDifficulty <= route.routeDifficulty

4. Filter by country (UI selection) → ruins.siteId === selectedCountry
   根据国家过滤（UI选择）→ ruins.siteId === selectedCountry

5. Random selection with probability → ruins.discoverProbability
   概率随机选择 → ruins.discoverProbability

6. Return discovery result
   返回发现结果
```

### Example Flow | 示例流程

**Scenario:** Player at Level 5, exploring Egypt

**场景：**5级玩家，探索埃及

```javascript
// Step 1: Player loadout
selectedItems = [1001(LiDAR), 1002(GPR), 1003(Magnetometry), 1005(Camera)]
totalWeight = 10 + 10 + 6 + 1 = 27

// Step 2: Match route
matchedRoute = "advanced_exploration" // (15-50 range)
routeDifficulty = "advanced"

// Step 3: Filter ruins
availableRuins = ruins.filter(ruin => 
  ruin.siteId === "site_egypt" &&
  ruin.requiredDifficulty <= "advanced"
)
// Result: Valley of Kings, Giza Pyramids, Karnak Temple
// (Sphinx requires "master" difficulty)

// Step 4: Random selection
discoveredRuin = randomSelect(availableRuins, ruin.discoverProbability)
```

---

## 6. Player Level Progression | 玩家等级进度

### Level vs Route Accessibility | 等级与路线可访问性

| Player Level | Item Slots | Max Weight* | Accessible Routes | New Unlocks |
|--------------|------------|-------------|-------------------|-------------|
| **Lv1** | 3 | ~8 | Beginner | Starting ruins |
| **Lv2** | 3 | ~14 | Beginner | Trowel, Drone, Wheelbarrow |
| **Lv3** | 4 | ~18 | Beginner + Advanced | Satellite, Tape Measure, Line Level |
| **Lv4** | 5 | ~24 | Advanced | Magnetometry |
| **Lv5** | 6 | ~34 | Advanced | LiDAR, GPR (legends!) |
| **Lv6** | 7 | ~42 | Advanced + Master | None (slot increase) |
| **Lv7+** | 8 | ~59 | Full Master | None (max slots) |

*Assuming average item weight of ~2.7 with all available items

*假设所有可用物品平均权重约2.7

### Strategic Milestones | 战略里程碑

- **Level 1**: Start exploring, discover famous ruins
- **1级**：开始探索，发现著名遗迹

- **Level 3**: Unlock Advanced route, access intermediate ruins
- **3级**：解锁进阶路线，访问中级遗迹

- **Level 5**: Legendary equipment unlocked, potential Master access
- **5级**：传说装备解锁，可能触发大师路线

- **Level 7**: Maximum item slots (8), full Master exploration capability
- **7级**：最大物品槽（8个），完全大师探索能力

---

## 7. Design Principles | 设计原则

### 1. Simplicity | 简洁性

✅ **Weight-only matching** - No complex item requirements
✅ **仅权重匹配** - 无复杂物品要求

✅ **Three difficulties** - Easy to understand progression
✅ **三个难度** - 易于理解的进度

✅ **No country binding** - Reduces configuration complexity
✅ **不绑定国家** - 降低配置复杂度

### 2. Flexibility | 灵活性

✅ **Any item combination** - Players have strategic freedom
✅ **任意物品组合** - 玩家有策略自由度

✅ **Overlapping ranges** - Smooth difficulty transitions
✅ **重叠范围** - 平滑的难度过渡

✅ **Future-proof** - Easy to add new routes without breaking existing content
✅ **面向未来** - 易于添加新路线而不破坏现有内容

### 3. Balance | 平衡性

✅ **Level-gated progression** - Item slots limit early game power
✅ **等级门控进度** - 物品槽限制早期游戏能力

✅ **Weight thresholds** - Require meaningful equipment choices
✅ **权重阈值** - 需要有意义的装备选择

✅ **Hidden ruins protection** - Master difficulty required for rare discoveries
✅ **隐藏遗迹保护** - 稀有发现需要大师难度

---

## 8. Configuration File Location | 配置文件位置

**Routes Configuration**: `/public/game-content/route-config/routes.json`

**路线配置文件**: `/public/game-content/route-config/routes.json`

---

## 9. Related Documentation | 相关文档

- **Item Configuration**: `/documents/item_config.md`
- **物品配置**: `/documents/item_config.md`

- **Sites & Ruins Summary**: `/documents/SITES_RUINS_SUMMARY.md`
- **站点和遗迹总结**: `/documents/SITES_RUINS_SUMMARY.md`

- **Level System**: `/public/game-content/user-config/level-system.json`
- **等级系统**: `/public/game-content/user-config/level-system.json`

---

## 10. Recent Changes | 最近更改

### 2025-11-01
- ✅ Simplified to 3 difficulty levels (Beginner/Advanced/Master)
- ✅ 简化为3个难度等级（新手/进阶/大师）

- ✅ Removed `targetSiteId` - routes no longer tied to countries
- ✅ 移除 `targetSiteId` - 路线不再关联国家

- ✅ Removed `discoveryPool`/`ruinsPool` - discovery handled by ruins configuration
- ✅ 移除 `discoveryPool`/`ruinsPool` - 发现由遗迹配置处理

- ✅ Removed `requiredItems` - pure weight-based matching
- ✅ 移除 `requiredItems` - 纯权重匹配

- ✅ Added `routeDifficulty` field - defines exploration capability
- ✅ 新增 `routeDifficulty` 字段 - 定义探索能力

- ✅ Routes define "HOW to explore", ruins define "WHAT can be discovered"
- ✅ 路线定义"如何探索"，遗迹定义"可发现什么"

---

*Last Updated: 2025-11-01*
