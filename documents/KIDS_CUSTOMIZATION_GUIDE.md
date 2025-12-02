# Kids Customization Guide / 儿童定制指南

**Customize the Archaeology Game (Config + Images)**  
**考古探索游戏（配置 + 图片）定制指南**

---

## Overview / 概述

**EN:** This guide helps kids safely customize the game by modifying JSON config files and image resources, without changing source code. Save changes and refresh the browser to see results.

**中文：** 这份指南帮助孩子不改源码、只改 JSON 配置与图片资源，完成"自己做游戏"的创作。保存修改后刷新网页即可看到效果。

---

**EN - What you can change:**
- Config files in `public/game-content`: items, routes, sites, ruins, level system
- Images in `public/assets/images`: item icons, ruin photos, site backgrounds, character image

**中文 - 能改哪些内容：**
- 配置文件（`public/game-content`）：物品、路线、国家/地区、遗址、升级与解锁
- 图片资源（`public/assets/images`）：物品图标、遗址照片、国家背景、角色形象

---

**EN - How it works:**
- The game loads JSON configs via fetch()
- Discovery results are chosen from `ruins.json` based on route difficulty and probabilities
- Level system controls unlocked items/sites and max item slots

**中文 - 工作原理：**
- 游戏会用 fetch() 加载 JSON 配置
- 探索结果会根据路线难度与概率从 `ruins.json` 中"抽取"遗址
- 等级系统控制已解锁物品/站点与每级可携带物品槽位

---

## 1. Files to Edit / 需要编辑的文件

### Items Configuration / 物品配置

**EN:** `public/game-content/item-config/items.json`
- Tools you can use: name, description, category, weight, rarity, icon path
- "itemCombinations" (sets) can add bonus weight

**中文：** `public/game-content/item-config/items.json`
- 决定可用探索工具（名称、说明、类别、重量、稀有度、图标路径）
- 支持"组合加成"（itemCombinations），让套装提高总重量

---

### Routes Configuration / 路线配置

**EN:** `public/game-content/route-config/routes.json`
- Exploration routes matched only by total weight
- Difficulty: beginner/advanced/master via `minWeight`/`maxWeight`

**中文：** `public/game-content/route-config/routes.json`
- 仅按总重量匹配路线（beginner/advanced/master）
- 通过 `minWeight`/`maxWeight` 控制触发难度

---

### Sites Configuration / 国家/地区配置

**EN:** `public/game-content/site-config/sites.json`
- Countries/regions (Site) with name, description, region, backgroundImage

**中文：** `public/game-content/site-config/sites.json`
- 定义国家/地区（Site）的名称、简介、区域、背景图

---

### Ruins Configuration / 遗址配置

**EN:** `public/game-content/site-config/ruins.json`
- Specific ruins: siteId, name, image, description, location, isHidden, requiredDifficulty, discoverProbability

**中文：** `public/game-content/site-config/ruins.json`
- 定义具体遗址：siteId、名称、图片、说明、位置、是否隐藏 isHidden、所需难度、出现概率等

---

### Level System Configuration / 等级系统配置

**EN:** `public/game-content/user-config/level-system.json`
- Levels, experience, max item slots per level, unlocked items/sites, exp rewards

**中文：** `public/game-content/user-config/level-system.json`
- 等级、经验、每级可携带物品数量、解锁的物品/站点、经验奖励

---

### Character Image / 角色形象

**EN:** `public/character.png`
- Explorer character image shown on the Exploration page

**中文：** `public/character.png`
- 探索页左侧角色形象来源

---

## 2. Where to Put Images / 图片存放位置

### Item Icons / 物品图标

**EN:** `public/assets/images/items/`
- Example in items.json: `"/assets/images/items/Camera.png"`

**中文：** `public/assets/images/items/`
- items.json 的 itemIcon 示例：`"/assets/images/items/Camera.png"`

---

### Ruin Images / 遗址图片

**EN:** `public/assets/images/ruins/`
- Example in ruins.json: `"/assets/images/ruins/great_pyramid.jpg"`

**中文：** `public/assets/images/ruins/`
- ruins.json 的 ruinImage 示例：`"/assets/images/ruins/great_pyramid.jpg"`

---

### Site Backgrounds / 国家背景

**EN:** `public/assets/images/sites/`
- Example in sites.json: `"/assets/images/sites/china.jpg"`

**中文：** `public/assets/images/sites/`
- sites.json 的 backgroundImage 示例：`"/assets/images/sites/china.jpg"`

---

### Image Tips / 图片建议

**EN:**
- Use letters, numbers, underscores/dashes (no spaces)
- PNG or JPG recommended
- Item icon size ~128–512 px; ruins photos ~800×600+
- If a path is wrong, the app shows a placeholder; no crash

**中文：**
- 文件名用英文、数字、下划线或中划线（避免空格）
- 推荐 PNG 或 JPG
- 物品图标尺寸约 128–512 px；遗址图片建议 800×600+
- 路径错误时会显示占位图，不会崩溃

---

## 3. JSON Tips / JSON 小贴士

**EN:**
- Use commas between entries; no trailing comma after the last item
- Keys and string values use double quotes
- Paths start with "/", e.g. `"/assets/images/items/MyCamera.png"`
- Backup before changes; revert if needed

**中文：**
- 项之间用英文逗号；最后一项后面不加逗号
- 键与字符串值用双引号
- 路径用 "/" 开头，如 `"/assets/images/items/MyCamera.png"`
- 修改前先备份；出错可回滚

---

## 4. Step-by-Step Kid Tasks / 孩子任务清单

### Task A: Replace an Item's Icon / 任务 A：给现有物品换图标

**EN:**
1. Put your image in `public/assets/images/items/` (e.g., MyCamera.png)
2. Edit items.json: change `itemIcon` to `"/assets/images/items/MyCamera.png"`
3. Refresh: check Inventory page

**中文：**
1. 把图片放到 `public/assets/images/items/`（如 MyCamera.png）
2. 编辑 items.json：把 `itemIcon` 改为 `"/assets/images/items/MyCamera.png"`
3. 刷新，在 Inventory 页面查看

---

### Task B: Add Your Own Tool / 任务 B：新增一个自创"工具"

**EN:**
Duplicate an item in items.json and edit fields:
- **itemId:** a new number (e.g., 2001)
- **itemName:** your tool's name
- **itemDescription:** what it does
- **itemCategory:** choose from detection_tools / recording_tools / digging_tools / cleaning_tools / utility_tools / measurement_tools
- **explorationWeight:** a number (higher → more likely advanced/master routes)
- **rarity:** common / rare / legendary
- **itemIcon:** your icon path

Refresh and view in Inventory page.

**中文：**
在 items.json 复制一个物品对象并修改：
- **itemId：** 新编号（如 2001）
- **itemName：** 工具名字
- **itemDescription：** 一句话介绍它能做什么
- **itemCategory：** 从 detection_tools / recording_tools / digging_tools / cleaning_tools / utility_tools / measurement_tools 中选
- **explorationWeight：** 数字（越大越容易触发高难度路线）
- **rarity：** common / rare / legendary
- **itemIcon：** 你的图标路径

刷新，在 Inventory 页面查看。

---

### Task C: Adjust Route Thresholds / 任务 C：调整路线触发范围

**EN:**
- Edit routes.json `minWeight`/`maxWeight` for beginner/advanced/master
- Refresh and check Exploration preview/route match

**中文：**
- 编辑 routes.json 的 `minWeight`/`maxWeight`，使路线更易或更难触发
- 刷新，在 Exploration 页面查看预览与匹配路线

---

### Task D: Add a New Ruin to a Site / 任务 D：给国家新增一个遗址

**EN:**
1. Choose a `siteId` from sites.json (e.g., site_egypt)
2. Put a photo in `public/assets/images/ruins/` (e.g., sphinx2.jpg)
3. Add an entry in ruins.json:
   - **siteId, ruinId, ruinName, ruinDescription, location**
   - **ruinImage:** `"/assets/images/ruins/sphinx2.jpg"`
   - **isHidden:** true/false
   - **requiredDifficulty:** beginner/advanced/master
   - **discoverProbability:** 0–1
4. Explore to trigger; check Gallery for collection

**中文：**
1. 在 sites.json 选择一个 `siteId`（如 site_egypt）
2. 把照片放到 `public/assets/images/ruins/`（如 sphinx2.jpg）
3. 在 ruins.json 末尾新增对象：
   - **siteId、ruinId、ruinName、ruinDescription、location**
   - **ruinImage：** `"/assets/images/ruins/sphinx2.jpg"`
   - **isHidden：** true/false
   - **requiredDifficulty：** beginner/advanced/master
   - **discoverProbability：** 0–1 之间的小数
4. 探索触发后，在 Gallery 页面能看到收集记录

---

### Task E: Tweak Levels and Unlocks / 任务 E：调整等级与解锁

**EN:**
- level-system.json: adjust `maxItemSlots`, `unlockedItems` at each level
- Tune `expRewards` for first-time and hidden discoveries

**中文：**
- 在 level-system.json 修改每级 `maxItemSlots`、`unlockedItems` 以及 `expRewards`
- 刷新后体验升级变化

---

### Task F: Change the Character Image / 任务 F：更换角色形象

**EN:**
- Replace `public/character.png` with your drawing
- See it on the Exploration page

**中文：**
- 用你画的图片替换 `public/character.png`
- 到 Exploration 页面查看效果

---

## 5. Verify Changes / 如何验证改动

**EN:**
- **Inventory:** icon and ownership display change as rules update
- **Exploration:** preview shows total weight and matched route; start exploration to see ruin image/description
- **Gallery:** grouped by site; discovered ruins show full content and date

**中文：**
- **Inventory：** 图标与拥有状态会跟随规则变化
- **Exploration：** 预览显示总重量与匹配路线；开始探索后显示遗址图片与说明
- **Gallery：** 按国家分组展示；已发现的遗址有完整信息与日期

---

## 6. Common Issues / 常见问题

### Data Load Failed / 加载失败

**EN:** Likely a JSON comma/quote issue or wrong path

**中文：** 大多是 JSON 逗号/引号错误或路径不对

---

### Broken Images / 图片不显示

**EN:** Check file exists, correct name/case/extension; hard refresh (Ctrl+F5)

**中文：** 检查文件是否存在、名称大小写与后缀；强制刷新（Ctrl+F5）

---

### No Route Match / 路线匹配不到

**EN:** Total weight not within any route range; adjust thresholds or weights

**中文：** 总重量不在任何范围；调整阈值或物品重量

---

### Ownership Not Right / 拥有状态异常

**EN:** Add itemId to level 1 `unlockedItems` or lower `itemUnlocks.requiredLevel`

**中文：** 把物品编号加入 1 级的 `unlockedItems`，或降低 `itemUnlocks.requiredLevel`

---

## 7. Classroom Activity Ideas / 课堂活动建议

**EN:**
- **Image team:** draw or select item/ruin images with consistent naming
- **Writing team:** write descriptions and add citation links ("citation" fields)
- **Rules team:** design routes and item sets; observe difficulty effects
- **Presentation:** show a "country + ruin + tools" theme and explain research sources

**中文：**
- **图片小组：** 统一风格与命名，绘制或挑选物品/遗址图片
- **文案小组：** 撰写物品和遗址说明，并补充 citation（资料链接）
- **规则小组：** 设计路线阈值与组合加成，观察难度变化的影响
- **展示：** 每组展示一个"国家 + 遗址 + 工具组合"主题，讲述资料来源与设计理由

---

## 8. Safety Reminders / 温馨提醒

**EN:**
- Change one file at a time and test
- Use `"/assets/images/..."` paths (no local absolute paths)
- Keep backups; revert if needed

**中文：**
- 每次只改一个文件，改完就测
- 路径统一用 `"/assets/images/..."` （不要用本机绝对路径）
- 保留备份，出错回滚

---

## Note / 说明

**EN:** Project documentation stays in English as per the specification. This bilingual guide is designed for classroom distribution and children's reading.

**中文：** 项目仓库文档保持英文为主；这份中英对照文档可用于课堂发放与阅读，便于孩子与老师双语参考。

---

**Document Version:** 1.0  
**Last Updated:** 2024-12  
**Target Audience:** Kids (Ages 8-14) and Educators
