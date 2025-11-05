# Level System Guide | 用户等级系统指南

## Overview | 概述

This document explains the player level progression system in the Archaeological Explorer game, including experience requirements, item unlocks, and progression mechanics.

本文档说明考古探险游戏中的玩家等级进度系统，包括经验值需求、物品解锁和成长机制。

---

## 1. Core Concepts | 核心概念

### Level System Philosophy | 等级系统设计哲学

**Progression = Item Slots + Item Unlocks**

**成长 = 物品槽位 + 物品解锁**

- ✅ Each level increases **max item slots** (carry capacity)
- ✅ 每个等级增加**物品槽位**（携带容量）

- ✅ Specific levels unlock **new items**
- ✅ 特定等级解锁**新物品**

- ✅ No level gates on exploration routes
- ✅ 探索路线无等级门槛

---

## 2. Level Progression Table | 等级进度表

| Level | Exp Required | Max Item Slots | Title | New Unlocks | Key Milestones |
|-------|--------------|----------------|-------|-------------|----------------|
| **1** | 0 | 3 | Novice Explorer | 6 basic items (default owned) | 🎮 Game Start |
| **2** | 50 | 3 | Field Archaeologist | Trowel, Wheelbarrow, Drone | 🔧 Excavation tools |
| **3** | 110 | 4 | Site Surveyor | Satellite, Tape Measure, Line Level | 📐 +1 slot, Measurement tools |
| **4** | 185 | 5 | Excavation Specialist | Magnetometry | 🧲 +1 slot, Advanced detection |
| **5** | 275 | 6 | Research Scholar | LiDAR, GPR | 🌟 +1 slot, Legendary equipment! |
| **6** | 385 | 7 | Technology Adopter | - | 📦 +1 slot |
| **7** | 515 | 8 | Cultural Heritage Expert | - | 🎯 +1 slot, Max slots reached |
| **8** | 670 | 8 | Site Director | - | 🏆 Leadership perks |
| **9** | 850 | 8 | International Explorer | - | 🌍 Global insights |
| **10** | 1060 | 8 | Master Archaeologist | - | 👑 Master level |

**Max Level**: 10
**Total Experience Required**: 1060

---

## 3. Item Slot Progression | 物品槽位成长

### Slot Unlock Timeline | 槽位解锁时间线

```
Level 1-2:  [⬜⬜⬜] = 3 slots
Level 3:    [⬜⬜⬜⬜] = 4 slots (+1)
Level 4:    [⬜⬜⬜⬜⬜] = 5 slots (+1)
Level 5:    [⬜⬜⬜⬜⬜⬜] = 6 slots (+1)
Level 6:    [⬜⬜⬜⬜⬜⬜⬜] = 7 slots (+1)
Level 7-10: [⬜⬜⬜⬜⬜⬜⬜⬜] = 8 slots (MAX)
```

### Strategic Impact | 战略影响

| Level Range | Item Slots | Max Weight* | Accessible Routes |
|-------------|------------|-------------|-------------------|
| **Lv1-2** | 3 | ~8 | Beginner only |
| **Lv3-4** | 4-5 | ~18-24 | Beginner + Advanced |
| **Lv5-6** | 6-7 | ~34-42 | Advanced + Master |
| **Lv7-10** | 8 (MAX) | ~59 | Full Master exploration |

*Assuming average item weight with all available items

*假设携带所有可用物品的平均权重

---

## 4. Item Unlocks by Level | 物品解锁详情

### Level 1 - Starting Equipment (6 items, default owned)

**新手起始装备（6个物品，默认拥有）**

| Item ID | Name | Weight | Category |
|---------|------|--------|----------|
| 1005 | Camera | 1 | Recording Tools |
| 1008 | Shovel | 2 | Digging Tools |
| 1009 | Hand Pick (Mattock) | 1 | Digging Tools |
| 1010 | Brush | 1 | Cleaning Tools |
| 1011 | Dental Pick | 1 | Cleaning Tools |
| 1012 | Bucket | 2 | Utility Tools |

**Total Weight**: 8
**Perks**: Basic exploration capabilities, Can carry up to 3 items

---

### Level 2 - Excavation & Mobility (3 items)

**挖掘与移动工具（3个物品）**

| Item ID | Name | Weight | Category |
|---------|------|--------|----------|
| 1007 | Trowel | 3 | Digging Tools |
| 1013 | Wheelbarrow | 3 | Utility Tools |
| 1006 | Drone | 4 | Detection Tools |

**Cumulative Weight**: 18 (with all items)
**Perks**: Improved digging capability, Drone exploration unlocked

---

### Level 3 - Precision Measurement (3 items)

**精确测量工具（3个物品）**

| Item ID | Name | Weight | Category |
|---------|------|--------|----------|
| 1004 | Aerial and Satellite Imagery | 5 | Detection Tools |
| 1014 | Tape Measure | 5 | Measurement Tools |
| 1015 | Line Level | 4 | Measurement Tools |

**Cumulative Weight**: 32
**Perks**: Aerial imaging available, Precision measurement, +5% hidden discovery rate, **+1 item slot (total 4)**

---

### Level 4 - Advanced Detection (1 item)

**高级探测工具（1个物品）**

| Item ID | Name | Weight | Category |
|---------|------|--------|----------|
| 1003 | Magnetometry | 6 | Detection Tools |

**Cumulative Weight**: 38
**Perks**: Magnetometry detection, +10% hidden discovery rate, **+1 item slot (total 5)**

---

### Level 5 - Legendary Technology (2 items) 🌟

**传说级科技（2个物品）**

| Item ID | Name | Weight | Category | Rarity |
|---------|------|--------|----------|--------|
| 1001 | LiDAR | 10 | Detection Tools | **Legendary** |
| 1002 | Ground-penetrating Radar (GPR) | 10 | Detection Tools | **Legendary** |

**Cumulative Weight**: 58
**Maximum Total Weight**: 59 (with all 15 items)
**Perks**: LiDAR & GPR unlocked, New exploration site, +15% all discovery rates, **+1 item slot (total 6)**

🎯 **Key Milestone**: First legendary equipment unlocked!

---

### Level 6-10 - Slot Expansion Only

**纯槽位扩展**

- **Level 6**: +1 slot (total 7), Advanced metal detection, +20% metallic artifact discovery
- **Level 7**: +1 slot (total 8, MAX), +25% experience from discoveries, Artifact context insights
- **Level 8**: Advanced team coordination, +30% hidden discovery rate
- **Level 9**: Cross-cultural insights
- **Level 10**: Legendary artifact access, +50% hidden discovery rate

---

## 5. Experience System | 经验值系统

### Configuration | 配置

```json
{
  "maxLevel": 20,
  "baseExpPerLevel": 50,
  "expGrowthRate": 1.15,
  "expRewards": {
    "normalDiscovery": 25,
    "hiddenDiscovery": 50,
    "firstTimeDiscovery": 30,
    "completeSiteBonus": 100,
    "explorationBonus": 15
  }
}
```

### Experience Calculation | 经验值计算

```javascript
// Level requirement formula
expRequired(level) = baseExpPerLevel × (expGrowthRate ^ (level - 1))

// Examples:
Level 1: 50 × 1.15^0 = 50
Level 2: 50 × 1.15^1 = 57.5 ≈ 58
Level 3: 50 × 1.15^2 = 66.125 ≈ 66
...
Level 10: 50 × 1.15^9 = 181.9 ≈ 182
```

### Experience Rewards | 经验值奖励

| Action | Exp Reward | Description |
|--------|------------|-------------|
| Normal Discovery | +25 | Discover a normal ruins |
| Hidden Discovery | +50 | Discover a hidden ruins (2x bonus) |
| First Time Discovery | +30 | First discovery of any ruins |
| Complete Site Bonus | +100 | Discover all ruins in a country |
| Exploration Bonus | +15 | Bonus per exploration attempt |

### Example Progression | 进度示例

```
🎮 New Player Journey:

Day 1:
- Start: Level 1 (0/50 exp)
- Explore Egypt → Discover Giza Pyramids (first time)
  → +25 (normal) + 30 (first time) + 15 (exploration) = +70 exp
- Result: Level 2! (20/110 exp)
- Unlock: Trowel, Wheelbarrow, Drone

Day 2:
- Explore China → Discover Terracotta Warriors (first time)
  → +25 + 30 + 15 = +70 exp
- Current: Level 2 (90/110 exp)
- Explore Egypt → Discover Valley of Kings (first time)
  → +25 + 30 + 15 = +70 exp
- Result: Level 3! (50/185 exp)
- Unlock: 4th item slot + Satellite + Tape Measure + Line Level

Day 3:
- Explore Greece → Discover Theatre of Dionysus
  → +25 + 30 + 15 = +70 exp
- Explore Egypt → Discover Sphinx (hidden!)
  → +50 + 30 + 15 = +95 exp
- Current: Level 3 (215/185 exp) → Level 4! (30/275 exp)
- Unlock: 5th item slot + Magnetometry
```

---

## 6. Perks System | 特权系统

### Discovery Rate Bonuses | 发现率加成

| Level | Bonus | Effect |
|-------|-------|--------|
| 3 | +5% hidden discovery | Slightly better chance for hidden ruins |
| 4 | +10% hidden discovery | Improved hidden ruins detection |
| 5 | +15% all discovery | Bonus applies to ALL ruins |
| 6 | +20% metallic artifact | Better chance for metal-based discoveries |
| 7 | +25% experience | Faster leveling from discoveries |
| 8 | +30% hidden discovery | Significantly better hidden ruins chance |
| 10 | +50% hidden discovery | Master-level hidden ruins access |

### Cumulative Bonuses | 累计加成

At **Level 10**, players enjoy:
- ✅ 8 item slots (maximum carrying capacity)
- ✅ +50% hidden discovery rate
- ✅ +25% experience gain
- ✅ Access to legendary equipment (LiDAR, GPR)
- ✅ All 15 items unlocked

---

## 7. Level vs Route Accessibility | 等级与路线可访问性

### Weight Requirements by Difficulty | 难度权重需求

| Route Difficulty | Weight Range | Min Level* | Item Slots Needed |
|------------------|--------------|------------|-------------------|
| **Beginner** | 1-20 | Lv1 | 3 slots (starting) |
| **Advanced** | 15-50 | Lv3 | 4-5 slots |
| **Master** | 40-999 | Lv5 | 6+ slots |

*Minimum level to comfortably access the route with available items

*能够舒适访问该路线所需的最低等级

### Progression Milestones | 进度里程碑

```
🎯 Level 1: Start exploring, discover famous ruins
   → Total weight: 8 (3 items)
   → Route: Beginner only

🎯 Level 3: Unlock Advanced route, access intermediate ruins
   → Total weight: 18-24 (4-5 items)
   → Route: Beginner + Advanced

🎯 Level 5: Legendary equipment unlocked, potential Master access
   → Total weight: 34+ (6 items)
   → Route: Advanced + Master (with proper loadout)

🎯 Level 7: Maximum item slots (8), full Master exploration capability
   → Total weight: 59 (all 15 items)
   → Route: Full Master exploration
```

---

## 8. Design Principles | 设计原则

### 1. Early Game Engagement | 早期游戏参与度

✅ **Immediate access** - 6 items unlocked from start
✅ **即时访问** - 从一开始就解锁6个物品

✅ **Quick progression** - First 3 levels achievable in ~5-10 discoveries
✅ **快速进度** - 前3级约5-10次发现即可达成

✅ **Clear rewards** - Each level provides visible benefits
✅ **清晰奖励** - 每个等级都有可见的好处

### 2. Balanced Progression | 平衡的进度

✅ **Slot gating** - Item slots limit early power, not item availability
✅ **槽位门控** - 通过槽位限制早期能力，而非物品可用性

✅ **Steady growth** - New slot every 1-2 levels until Level 7
✅ **稳定成长** - 每1-2级增加一个槽位，直到7级

✅ **Endgame plateau** - Levels 7-10 focus on perks, not slots
✅ **终局平台期** - 7-10级专注于特权，而非槽位

### 3. Player Freedom | 玩家自由度

✅ **No route locks** - All routes accessible based on weight only
✅ **无路线锁定** - 所有路线仅基于权重访问

✅ **Strategic choice** - Players choose which items to carry
✅ **战略选择** - 玩家选择携带哪些物品

✅ **Multiple paths** - Different item combinations for same difficulty
✅ **多样路径** - 相同难度的不同物品组合

---

## 9. Configuration File | 配置文件

**Location**: `/public/game-content/user-config/level-system.json`

**位置**: `/public/game-content/user-config/level-system.json`

### Key Sections | 关键部分

1. **`levelSystem`** - Global level system configuration
   - `maxLevel`: Maximum achievable level (currently 10)
   - `baseExpPerLevel`: Base experience per level (50)
   - `expGrowthRate`: Experience growth multiplier (1.15)
   - `expRewards`: Experience rewards for different actions

2. **`levels`** - Array of level definitions
   - `level`: Level number
   - `expRequired`: Cumulative experience needed
   - `maxItemSlots`: Maximum items player can carry
   - `title`: Level title/rank
   - `description`: Level description
   - `unlockedItems`: Array of item IDs unlocked at this level
   - `unlockedSites`: Array of site IDs unlocked (if any)
   - `perks`: Array of perk descriptions

3. **`itemUnlocks`** - Item unlock requirements (legacy, not used)
   - This section exists but is **NOT USED** in code
   - Item unlocking is managed via `levels[].unlockedItems` only

4. **`siteUnlocks`** - Site unlock requirements
   - Maps site IDs to required levels and difficulty

---

## 10. Related Documentation | 相关文档

- **Item Configuration**: `/documents/item_config.md`
- **物品配置**: `/documents/item_config.md`

- **Route Configuration**: `/documents/route_config.md`
- **路线配置**: `/documents/route_config.md`

- **Sites & Ruins Summary**: `/documents/SITES_RUINS_SUMMARY.md`
- **站点和遗迹总结**: `/documents/SITES_RUINS_SUMMARY.md`

---

## 11. Recent Changes | 最近更改

### 2025-11-01
- ✅ Added `maxItemSlots` field to each level
- ✅ 为每个等级添加 `maxItemSlots` 字段

- ✅ Slot progression: 3 → 3 → 4 → 5 → 6 → 7 → 8 (max at Level 7)
- ✅ 槽位进度：3 → 3 → 4 → 5 → 6 → 7 → 8（7级达到最大值）

- ✅ Item unlocking unified in `levels[].unlockedItems` only
- ✅ 物品解锁统一在 `levels[].unlockedItems` 中管理

- ✅ Removed `requiredLevel` from items.json (single source of truth)
- ✅ 从items.json中移除 `requiredLevel`（单一数据源）

- ✅ 6 basic items set as default owned (`isDefaultOwned: true`)
- ✅ 6个基础物品设为默认拥有（`isDefaultOwned: true`）

---

*Last Updated: 2025-11-01*
