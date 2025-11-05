# Item Configuration Guide | 物品配置指南

## Overview | 概述

This document explains the item configuration system in the Archaeological Explorer game, including exploration weight, rarity, and item combinations.

本文档说明考古探险游戏中的物品配置系统，包括探索权重、稀有度和物品组合机制。

---

## 1. Exploration Weight | 探索权重

### Mechanism | 作用机制

Exploration weight determines the **depth and accessible areas** of exploration.

探索权重决定了**探索的深度和能到达的区域**。

### Weight Calculation | 权重计算规则

```
Total Weight = Sum of all selected items' weights + Item combination bonus
总权重 = 所有选中物品的权重之和 + 物品组合奖励
```

### Weight Tiers | 权重等级对应

| Total Weight Range<br>总权重范围 | Exploration Level<br>探索等级 | Accessible Areas<br>能到达的区域 | Example Combination<br>典型组合示例 |
|-----------|---------|-------------|-------------|
| 1-3 | **Surface** 表面 | Exterior, shallow areas<br>外部、浅层区域 | Brush(1) + Notebook(1) = 2<br>刷子(1) + 笔记本(1) = 2 |
| 4-6 | **Moderate** 中层 | Interior corridors, rooms<br>内部走廊、房间 | Brush(1) + Trowel(3) + Notebook(1) = 5<br>刷子(1) + 铲子(3) + 笔记本(1) = 5 |
| 7-10 | **Deep** 深层 | Secret passages, treasure rooms<br>秘密通道、宝库 | Trowel(3) + Metal Detector(5) = 8<br>铲子(3) + 金属探测器(5) = 8 |
| 11+ | **Legendary** 传说 | Most hidden areas<br>最隐秘区域 | Deep combo + Combination bonus<br>深层组合 + 组合奖励 |

### Route Matching Example | 路线匹配示例

Route configuration in `routes.json`:

路线配置在 `routes.json` 中：

```json
{
  "routeId": "pyramid_surface_basic",
  "triggerConditions": {
    "minWeight": 1,
    "maxWeight": 4
  }
}

{
  "routeId": "pyramid_deep_expert", 
  "triggerConditions": {
    "minWeight": 8,
    "maxWeight": 15
  }
}
```

### Strategic Considerations | 策略考量

- **Higher weight** → Deeper exploration → Higher hidden discovery probability
- **更高权重** → 更深探索 → 更高隐藏发现概率

- **Not always better**: Need to match route weight ranges
- **并非越高越好**：需要匹配路线的权重范围

- **Risk of skipping**: Too high weight may skip routes that require lower weight
- **跳过风险**：权重过高可能跳过只能用低权重触发的路线

---

## 2. Rarity | 稀有度

### Rarity Classification System | 稀有度分级系统

Rarity is determined purely by **exploration weight**. Simple and straightforward.

稀有度纯粹由**探索权重**决定。简单明了。

#### Classification Criteria | 分级标准

**Common (普通)** - Weight 1-3
- Basic exploration tools
- 基础探索工具
- Suitable for surface and shallow exploration
- 适用于表面和浅层探索
- Examples: Brush (1), Notebook (1), Trowel (3), Camera (2), Flashlight (2), Magnifying Glass (2)
- 示例：刷子(1)、笔记本(1)、铲子(3)、相机(2)、手电筒(2)、放大镜(2)

**Rare (稀有)** - Weight 4-6
- Advanced equipment with high power
- 高威力的高级设备
- Enables deep exploration
- 可进行深层探索
- Examples: Metal Detector (5), Ancient Map (4)
- 示例：金属探测器(5)、古代地图(4)

**Legendary (传说)** - Weight 7-10
- Ultimate exploration equipment
- 终极探索装备
- Game-changing power
- 改变游戏的威力
- Maximum impact on exploration results
- 对探索结果产生最大影响
- Reserved for future top-tier items
- 为未来顶级物品预留
- Examples: (To be added)
- 示例：（待添加）

### Rarity Levels | 稀有度等级

| Rarity<br>稀有度 | Weight Range<br>权重范围 | Current Items<br>当前物品示例 | Unlock Level<br>解锁等级 |
|-------|------|-------------|-------------|
| **common**<br>普通 | 1-3 | Brush, Notebook, Trowel, Camera, Flashlight, Magnifying Glass<br>刷子、笔记本、铲子、相机、手电筒、放大镜 | 1-4 |
| **rare**<br>稀有 | 4-6 | Metal Detector, Ancient Map<br>金属探测器、古代地图 | 1-3 |
| **legendary**<br>传说 | 7-10 | (Reserved for future)<br>（为未来预留） | TBD |

### ⚠️ Important Design Change | 重要设计变更

**Rarity is NOT tied to unlock level** | **稀有度不再与解锁等级挂钩**

- Rare items can be unlocked at low levels (Metal Detector at Level 1)
- 稀有物品可在低等级解锁（金属探测器在1级）

- Legendary items can be unlocked earlier (Ancient Map at Level 3)
- 传说物品可更早解锁（古代地图在3级）

- Rarity now represents item power and special effects, not acquisition difficulty
- 稀有度现在代表物品强度和特殊效果，而非获取难度

### Rarity Impact | 稀有度影响

1. **UI Display** | **UI显示**
   - Different colors/styles for different rarities
   - 不同颜色/样式标识不同稀有度

2. **Unlock Requirements** | **解锁要求**
   - Higher rarity usually requires higher level
   - 稀有度越高，通常需求等级越高

3. **Special Effects** | **特殊效果**
   - Rare items often have special abilities:
   - 稀有物品通常有特殊效果：
     - Metal Detector: Greatly improves metallic artifact discovery
     - 金属探测器：大幅提升金属文物发现率
     - Ancient Map: Hidden discovery probability +15%
     - 古代地图：隐藏发现概率 +15%

### Potential Extensions | 可扩展功能

- Acquisition difficulty (requires achievements)
- 获取难度（需要完成特定成就）

- Equipment slot limits (only 1 legendary item)
- 装备槽位限制（只能携带1个传说级物品）

- Combination bonus multipliers
- 组合加成倍率

---

## 3. Item Combinations | 物品组合

### Combination Mechanism | 组合机制

When players **carry all items** listed in a combination simultaneously, they receive additional bonuses.

当玩家**同时携带**组合中列出的所有物品时，获得额外奖励。

### Current Combinations | 当前组合

#### Combination 1: Classic Archaeological Set | 组合1：经典考古套装

```json
{
  "comboName": "Classic Archaeological Set",
  "requiredItems": [1001, 1004, 1002],
  "comboEffect": {
    "weightBonus": 2,
    "specialEffect": "Increases discovery probability for all artifact types"
  }
}
```

**Effect | 效果：**
- Individual weights: 1(Brush/1001) + 3(Trowel/1004) + 1(Notebook/1002) = **5**
- 单独携带：1(刷子/1001) + 3(铲子/1004) + 1(笔记本/1002) = **5**

- With combo: 5 + 2(combo bonus) = **7** ⭐
- 触发组合：5 + 2(组合奖励) = **7** ⭐

- **Impact**: Jumps from Moderate(5) to Deep(7)!
- **影响**：从中层(5)直接跳到深层(7)！

#### Combination 2: Modern Explorer Set | 组合2：现代探索者套装

```json
{
  "comboName": "Modern Explorer Set",
  "requiredItems": [1003, 1007, 1008],
  "comboEffect": {
    "weightBonus": 3,
    "specialEffect": "Greatly improves hidden discovery probability"
  }
}
```

**Effect | 效果：**
- Individual weights: 5(Metal Detector/1003) + 2(Camera/1007) + 2(Flashlight/1008) = **9**
- 单独携带：5(金属探测器/1003) + 2(相机/1007) + 2(手电筒/1008) = **9**

- With combo: 9 + 3(combo bonus) = **12** ⭐⭐
- 触发组合：9 + 3(组合奖励) = **12** ⭐⭐

- **Impact**: Enters Legendary tier (11+)!
- **影响**：进入传说级探索范围(11+)！

### Strategic Value | 战略意义

1. **Weight Breakthrough** | **权重跃升**
   - Break through weight bottlenecks to trigger higher-tier routes
   - 突破权重瓶颈，触发更高级路线

2. **Special Effects** | **特殊效果**
   - Beyond weight bonus, provides additional benefits
   - 除了权重加成，还有额外效果
   - Classic Set: Improves all artifact discovery probability
   - 经典套装：提升所有文物发现概率
   - Modern Set: Improves hidden discovery probability
   - 现代套装：提升隐藏发现概率

3. **Strategic Choice** | **策略选择**
   - Players must balance:
   - 玩家需要权衡：
     - Carry more single high-weight items?
     - 带更多单一高权重物品？
     - Or assemble combo for bonuses?
     - 还是凑齐组合获得奖励？

### Code Implementation | 代码实现

In `gameEngine.js` - `calculateCombinationBonus` method:

在 `gameEngine.js` 中的 `calculateCombinationBonus` 方法：

```javascript
calculateCombinationBonus(selectedItems) {
  let bonus = 0
  
  this.itemCombinations.forEach(combo => {
    if (this.hasAllItems(selectedItems, combo.requiredItems)) {
      bonus += combo.comboEffect?.weightBonus || 0
    }
  })
  
  return bonus
}
```

---

## 4. Practical Game Examples | 实际游戏示例

### Scenario 1: Level 1 Player - Basic Exploration | 场景1：1级玩家 - 基础探索

- **Available items** | **可用物品**: Brush(1001), Notebook(1002), Metal Detector(1003)
- **Carried items** | **携带物品**: 1001 + 1002 + 1003 = Total weight **7**
- **Triggered route** | **触发路线**: `pyramid_deep_expert` (weight 8-15, needs adjustment)
- **Exploration level** | **探索等级**: Deep
- **Hidden discovery probability** | **隐藏发现概率**: 25%
- **🎯 Key improvement**: Level 1 players can now access deep exploration!
- **🎯 关键改进**：1级玩家现在可以进行深层探索！

### Scenario 2: Level 2 Player - Classic Combo | 场景2：2级玩家 - 经典组合

- **New unlocked items** | **新解锁物品**: Trowel(1004), Magnifying Glass(1005)
- **Carried items** | **携带物品**: 1001 + 1004 + 1002 = 5
- **Combo triggered** | **触发组合** → 5 + 2 = Total weight **7**
- **Exploration level** | **探索等级**: Deep
- **Hidden discovery probability** | **隐藏发现概率**: 25%
- **Max possible weight** | **最大可能权重**: 1+3+1+5+2 = **12** (Legendary tier)

### Scenario 3: Level 3 Player - Modern Set | 场景3：3级玩家 - 现代套装

- **New unlocked items** | **新解锁物品**: Ancient Map(1006), Camera(1007)
- **Carried items** | **携带物品**: 1003 + 1007 + 1008 = 9
- **Combo triggered** | **触发组合** → 9 + 3 = Total weight **12**
- **Exploration level** | **探索等级**: Legendary
- **Hidden discovery probability** | **隐藏发现概率**: 40%+ (base 25% + Ancient Map 15%)
- **Max possible weight** | **最大可能权重**: 1+1+5+3+2+4+2 = **18** (Super Legendary)

---

## 5. Summary | 总结

**Exploration Weight** | **探索权重** = Determines exploration depth | 决定能去多深

**Rarity** | **稀有度** = Item's value and special effects | 物品的珍贵程度和特殊效果

**Item Combinations** | **物品组合** = Strategic bonuses, encourages specific loadouts | 策略性加成，鼓励特定搭配

### Design Benefits | 设计优势

✅ **Simple and intuitive** | **简单易懂** - Numeric values are straightforward
✅ **Strategic depth** | **策略性强** - Requires thoughtful loadout planning
✅ **Extensible** | **可扩展** - Easy to add new combinations and items

---

## 6. Item ID Mapping | 物品ID映射表

### Current Item IDs | 当前物品ID (15 items)

| Item ID | Item Name (EN) | Item Name (CN) | Weight | Rarity | Unlock Level |
|---------|----------------|----------------|--------|--------|-------------|
| **1001** | LiDAR | 激光雷达 | 10 | legendary | 5 |
| **1002** | Ground-penetrating Radar (GPR) | 地质雷达 | 10 | legendary | 5 |
| **1003** | Magnetometry | 磁力仪 | 6 | rare | 4 |
| **1004** | Aerial and Satellite Imagery | 航拍卫星影像 | 5 | rare | 3 |
| **1005** | Camera | 相机 | 1 | common | 1 |
| **1006** | Drone | 无人机 | 4 | rare | 2 |
| **1007** | Trowel | 铲子 | 3 | common | 2 |
| **1008** | Shovel | 铁锹 | 2 | common | 1 |
| **1009** | Hand Pick (Mattock) | 手镐 | 1 | common | 1 |
| **1010** | Brush | 刷子 | 1 | common | 1 |
| **1011** | Dental Pick | 牙科钩 | 1 | common | 1 |
| **1012** | Bucket | 桶 | 2 | common | 1 |
| **1013** | Wheelbarrow | 手推车 | 3 | common | 2 |
| **1014** | Tape Measure | 卷尺 | 5 | rare | 3 |
| **1015** | Line Level | 水平仪 | 4 | rare | 3 |

### Level Unlock Distribution | 等级解锁分布

**Level 1 (6 items) - Default Owned** | 默认拥有的基础工具
- Camera (1), Shovel (2), Hand Pick (1), Brush (1), Dental Pick (1), Bucket (2)
- 相机(1)、铁锹(2)、手镐(1)、刷子(1)、牙科钩(1)、桶(2)
- **Total starting weight: 8** (all items owned by default)
- **起始总权重：8**（所有物品默认拥有）
- ✅ **New players can explore immediately!**
- ✅ **新玩家可以立即开始探索！**

**Level 2 (3 items)** - Excavation & Mobility | 挖掘与移动
- Trowel (3), Wheelbarrow (3), Drone (4)
- 铲子(3)、手推车(3)、无人机(4)
- **Cumulative weight: 18** (with all items owned)
- **累计权重：18**（拥有所有物品）

**Level 3 (3 items)** - Precision Measurement | 精确测量
- Aerial and Satellite Imagery (5), Tape Measure (5), Line Level (4)
- 航拍卫星影像(5)、卷尺(5)、水平仪(4)
- **Cumulative weight: 33**
- **累计权重：33**

**Level 4 (1 item)** - Advanced Detection | 高级探测
- Magnetometry (6)
- 磁力仪(6)
- **Cumulative weight: 39**
- **累计权重：39**

**Level 5 (2 items)** - Legendary Technology | 传说科技
- LiDAR (10), Ground-penetrating Radar (GPR) (10)
- 激光雷达(10)、地质雷达(10)
- **Maximum total weight: 59** 🚀
- **最大总权重：59** 🚀

### Item Structure | 物品数据结构

```json
{
  "itemId": 1005,
  "itemName": "Camera",
  "itemDescription": "In archeology camera can be used to take pictures of artifacts or other important things and use them as records.",
  "itemIcon": "/assets/images/items/Camera.png",
  "itemCategory": "recording_tools",
  "explorationWeight": 1,
  "rarity": "common",
  "isDefaultOwned": true,
  "citation": "https://en.wikipedia.org/wiki/Camera"
}
```

**Field Descriptions | 字段说明:**

- `itemId` (number): Unique item identifier | 物品唯一标识符
- `itemName` (string): Item display name | 物品显示名称
- `itemDescription` (string): Item description | 物品描述
- `itemIcon` (string): Icon image path | 图标路径
- `itemCategory` (string): Item category | 物品分类
- `explorationWeight` (number): Exploration power (1-10) | 探索权重(1-10)
- `rarity` (string): Rarity level (common/rare/legendary) | 稀有度(common/rare/legendary)
- `isDefaultOwned` (boolean): Initially owned (true for Lv1 items) | 初始是否拥有（Lv1物品为true）
- `citation` (string): Reference URL for related knowledge | 相关知识参考链接

**Note**: `requiredLevel` field has been **REMOVED**. Item unlocking is now managed exclusively in `level-system.json`.

**注意**：`requiredLevel` 字段已**移除**。物品解锁现在仅在 `level-system.json` 中管理。

---

## 7. Configuration File Location | 配置文件位置

- **Item config** | **物品配置**: `/public/game-content/item-config/items.json`
- **Route config** | **路线配置**: `/public/game-content/route-config/routes.json`
- **Level system** | **等级系统**: `/public/game-content/user-config/level-system.json`

---

## 8. Recent Changes | 最近更改

### 2025-11-01
- ✅ Changed `itemId` from string to number (1001-1015)
- ✅ 将 `itemId` 从字符串改为数字 (1001-1015)

- ✅ **Removed `requiredLevel` field** - Item unlocking managed in `level-system.json` only
- ✅ **移除 `requiredLevel` 字段** - 物品解锁仅在 `level-system.json` 中管理

- ✅ **Set Level 1 items as default owned** - `isDefaultOwned: true` for 6 basic items
- ✅ **设置1级物品为默认拥有** - 6个基础物品的 `isDefaultOwned: true`

- ✅ Removed `effectDescription` field from item configuration
- ✅ 从物品配置中移除了 `effectDescription` 字段

- ✅ Decoupled rarity from unlock level
- ✅ 解除稀有度与解锁等级的耦合

- ✅ Simplified rarity classification: Common(1-3), Rare(4-6), Legendary(7-10)
- ✅ 简化稀有度分级：Common(1-3), Rare(4-6), Legendary(7-10)

- ✅ Added `citation` field for educational reference links
- ✅ 新增 `citation` 字段用于教育参考链接

- ✅ **Avoided data duplication** - Single source of truth for item unlocking
- ✅ **避免数据重复** - 物品解锁的单一数据源

---

*Last Updated: 2025-11-01*
