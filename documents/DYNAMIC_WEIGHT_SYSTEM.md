# 动态权重系统说明

## 📊 系统概述

本游戏采用**动态权重阶梯系统**，无需固定的最大权重限制，能够自动适应物品数量的增长。

## 🎯 核心设计理念

### **问题背景**
- 原有系统：固定 `maxWeight`（如1-4, 4-8, 8-15）
- 问题：物品增加后，总权重可能超过59，无法匹配高级路线
- 解决：使用**权重阶梯**替代固定上限

## ⚙️ 权重阶梯定义

| 阶梯等级 | minWeight | maxWeight | 适用场景 |
|---------|-----------|-----------|---------|
| **Basic** | 1-5 | 10-15 | 表面探索，初学者路线 |
| **Intermediate** | 10-15 | 30 | 中层探索，进阶路线 |
| **Advanced** | 20-30 | 50 | 深层探索，专家路线 |
| **Expert** | 40-50 | 100 | 终极探索，高手路线 |
| **Master** | 60+ | 999 | 无上限，传说路线 |

## 🔧 配置示例

```json
{
  "routeId": "pyramid_deep_expert",
  "routeName": "Pyramid Deep Expert Exploration",
  "triggerConditions": {
    "requiredItems": [1004, 1003],
    "minWeight": 20,
    "weightTier": "advanced",
    "maxWeight": 999,
    "specialRequirements": {
      "mustIncludeCategories": ["digging_tools", "detection_tools"]
    }
  }
}
```

### **关键字段说明**

- `minWeight`: **最小权重要求**，必须达到才能触发路线
- `maxWeight`: **最大权重限制**，设置为999表示无上限
- `weightTier`: **权重阶梯标识**（文档用途，用于理解路线定位）

## 📈 动态扩展性

### **当前物品总权重**
- 15个物品总权重：**59**
- 包含组合奖励：**最高65**

### **未来扩展空间**
```
假设新增物品：
- 物品数量增至30个
- 平均权重4，总权重120
- 组合奖励最高10
- 实际最大权重：130

现有配置能够完美支持！
```

## 🎮 玩家体验

### **1. 无感知增长**
- 玩家不会因为物品增加而感到路线"过时"
- 新物品自然融入现有探索系统

### **2. 策略深度**
- 不同权重组合触发不同路线
- 高权重≠更好，需要匹配具体路线需求

### **3. 渐进式解锁**
```
起始阶段：权重5-10  → Basic路线
成长阶段：权重15-25 → Intermediate路线
成熟阶段：权重30-45 → Advanced路线
终极阶段：权重60+   → Master路线
```

## 🔄 路线匹配逻辑

```javascript
// 匹配流程
1. 检查必需物品 (requiredItems)
2. 检查权重范围 (minWeight ≤ totalWeight ≤ maxWeight)
3. 检查排斥物品 (excludedItems)
4. 检查特殊要求 (specialRequirements)
5. 按优先级排序，选择最高优先级路线
```

## ⚠️ 注意事项

### **maxWeight设置建议**

| 路线类型 | maxWeight设置 | 原因 |
|---------|--------------|------|
| 初级路线 | 10-15 | 防止高装备进入低级区域 |
| 中级路线 | 25-35 | 平衡装备要求 |
| 高级路线 | 50-100 | 为未来预留空间 |
| 终极路线 | 999 | 无上限，接纳所有高配置 |

### **权重平衡原则**

1. **不要让所有路线都设置999**
   - 会导致低装备也能进高级区域
   - 失去策略性

2. **合理设置minWeight**
   - 确保路线有明确的"入场门槛"
   - 引导玩家升级装备

3. **预留扩展空间**
   - 当前最大59，建议高级路线maxWeight设置100+
   - 为未来50-100个物品预留空间

## 📊 当前路线分布

| 路线 | minWeight | maxWeight | 阶梯 |
|------|-----------|-----------|------|
| pyramid_surface_basic | 1 | 15 | Basic |
| pyramid_beginner_friendly | 5 | 15 | Intermediate |
| pyramid_interior_moderate | 10 | 30 | Intermediate |
| pyramid_deep_expert | 20 | 999 | Advanced |
| terracotta_surface_basic | 1 | 10 | Basic |
| terracotta_deep_expert | 15 | 999 | Advanced |
| pompeii_surface_basic | 1 | 10 | Basic |
| pompeii_interior_moderate | 10 | 30 | Intermediate |

## 🚀 未来优化方向

1. **自动权重计算**
   - 根据当前物品总数动态调整阶梯范围

2. **百分比匹配**
   - 基于"携带物品权重占总权重的百分比"

3. **难度分级**
   - 引入难度系数，动态调整发现概率

4. **装备评分系统**
   - 综合考虑权重、稀有度、组合等因素

---

**总结**：动态权重系统通过宽松的`maxWeight`和明确的`minWeight`，实现了可持续扩展的探索机制，无论物品数量如何增长，都能保持游戏平衡性。
