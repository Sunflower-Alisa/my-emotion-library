# 心迹手账 — 项目计划书

## 1. 项目概述

| 项目 | 内容 |
|---|---|
| 项目名称 | 心迹手账 |
| 英文名 | HeartNote |
| 前端技术栈 | uni-app (Vue 3) + 微信小程序 |
| 后端技术栈 | .NET 10 WebAPI + SQLite + JWT |
| 数据方案 | MVP 阶段本地存储 (uni-storage) → 后端 SQLite 云端同步 |
| 目标平台 | 微信小程序（H5 亦可构建） |
| 部署平台 | 腾讯云服务器 |

## 2. 核心功能

- **情绪标签系统**：10种预设情绪（开心/平静/悲伤/愤怒/焦虑/恐惧/惊喜/疲惫/困惑/感激），记录时选择
- **每日情绪记录**：以情绪为主题，一天可记录多次
- **极速记录**：10秒快速记录，选情绪标签+可选备注
- **伯恩斯5栏情绪日志**：基于CBT认知行为疗法的结构化记录模板
- **情绪日历**：月度日历视图，颜色标记每日情绪
- **周情绪趋势**：柱状图展示近7天情绪变化
- **日期筛选**：按日期筛选查看历史日志
- **功能介绍页**：引导用户了解工具功能
- （后续）更多记录模板
- （后续）云端数据同步

## 3. 模板规划

### v1.0 — 伯恩斯 5栏情绪日志

基于大卫·伯恩斯 CBT 方法的情绪记录工具：

| 栏位 | 内容 | 交互形式 |
|---|---|---|
| ① 情绪标签 | 选择当前情绪 | 标签选择（10种，emoji+颜色） |
| ② 情境 | 时间、地点、人物、事件 | 文本输入 + 示例引导 |
| ③ 自动思维 | 当时的负面想法 | 文本输入 + 相信度评分(0-100%) + 示例引导 |
| ④ 认知扭曲 | 识别扭曲类型 | 多选标签(10种全部展示) + 示例引导 |
| ⑤ 理性回应 | 客观反驳 | 文本输入 + 相信度评分(0-100%) + 示例引导 |
| ⑥ 结果 | 重新评估情绪 | 情绪打分(0-100%) + 可选备注 + 示例引导 |

**10种认知扭曲**：非此即彼思维、灾难化、否定正面、情绪推理、贴标签、夸大/缩小、心理过滤、应该陈述、归己化、读心术

说明：每栏均配有填写示例和引导说明，帮助用户完成记录。

### 极速记录

快速记录模式，不经过结构化流程：
- 选择情绪标签（10种）
- 可选备注文本
- 一键保存

### 后续模板规划

- 待定（TBD）

## 4. UI 风格

- **温暖治愈风**
- 柔和色调（暖杏色 #E8A87C 为主色调）
- 圆角卡片布局
- 留白充足，视觉舒适
- 日历组件使用 flexbox 布局（兼容微信小程序，替代 CSS grid）
- "我的"页面使用手风琴折叠（三个区块点击展开/收起）
- 反馈功能使用 formsubmit.co 免费表单转邮件服务

## 5. 页面规划

| 页面 | 路由 | 功能 | Tab |
|---|---|---|---|
| 首页 | `/pages/index/index` | 今日情绪概况、周情绪趋势、极速记录/详细记录/历史记录3入口 | ✅ |
| 我的 | `/pages/profile/profile` | 头像/统计/数据管理(折叠)/反馈建议(折叠)/关于(折叠) | ✅ |
| 记录页 | `/pages/record/record` | 选择模板（极速记录/伯恩斯5栏） | |
| 极速记录 | `/pages/quick-record/quick-record` | 选情绪标签+备注，一键保存 | |
| 历史页 | `/pages/history/history` | 列表/日历双视图、日期筛选、详情弹窗 | |
| 功能介绍 | `/pages/intro/intro` | 应用功能介绍页 | |

## 6. 技术架构

```
my-emotion-library/
├── scripts/
│   └── patch-uni-app.js       # uni-app 兼容补丁
├── src/
│   ├── constants/              # 常量定义（情绪标签等）
│   ├── pages/                  # 页面（6个）
│   ├── components/             # 组件（模板组件）
│   ├── store/                  # Pinia 状态管理
│   ├── config/                 # 配置文件
│   ├── utils/                  # 工具函数（含 api.js 后端调用）
│   └── static/                 # 静态资源（预留）
├── backend/                    # .NET 10 WebAPI 后端
│   ├── HeartNote.slnx
│   └── HeartNote.Api/
│       ├── Program.cs           # 入口（SQLite + JWT + 微信登录）
│       ├── appsettings.json     # 配置
│       ├── Controllers/         # API 控制器
│       ├── Models/              # 数据实体
│       ├── Dtos/                # 请求/响应 DTO
│       ├── Services/            # 业务服务
│       └── Data/                # EF Core 数据上下文
├── tests/                       # Vitest 单元测试
├── manifest.json                # uni-app 配置
├── pages.json                   # 路由配置（含 tabBar）
├── App.vue / main.js
├── vite.config.js
└── package.json
```

## 7. 数据模型

### 记录 (Record)

```js
{
  id: String,          // 唯一标识
  date: String,        // 日期 YYYY-MM-DD
  createdAt: String,   // 创建时间 HH:MM
  template: String,    // 'burns' | 'quick'
  emotion: {           // 情绪标签
    label: String,     // 开心、平静...
    emoji: String,     // 😊、😌...
    color: String      // #A8D5BA...
  } | null,
  // 伯恩斯5栏专属字段
  situation: String,
  autoThought: String,
  autoThoughtBelief: Number,
  cognitiveDistortions: [String],
  rationalResponse: String,
  rationalResponseBelief: Number,
  result: { score: Number, note: String },
  // 极速记录专属字段
  note: String
}
```

### 用户 (User)

```json
{
  "id": "int",
  "openId": "string (微信 openid, 唯一索引)",
  "nickname": "string?",
  "avatarUrl": "string?",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### 微信登录流程

```
小程序                  后端                         微信服务器
  │                     │                             │
  ├─ uni.login() ───────┤                             │
  │   获取 code         │                             │
  ├─ POST /api/auth/login ──→                         │
  │   { code }          │                             │
  │                     ├─ GET jscode2session ────────→│
  │                     │   appid + secret + code      │
  │                     │←──── { openid, session_key } │
  │                     │                             │
  │                     ├─ 查询/创建 User (SQLite)     │
  │                     ├─ 生成 JWT Token             │
  │←─── { token, user } ─┤                             │
  │ 存储 token, 后续请求带 Authorization: Bearer       │
```

## 8. 开发路线

1. **Phase 1**：项目初始化 + 目录搭建
2. **Phase 2**：首页 + 伯恩斯5栏模板页面
3. **Phase 3**：本地存储层 + 历史记录页
4. **Phase 4**：情绪标签 + 极速记录 + 情绪日历 + 日期筛选 + 功能介绍 + 周趋势
5. **Phase 4.5**：Bug 修复（介绍页导航、极速记录布局、主页极速记录入口、日历内联到历史页、周趋势按周一到周日顺序）
6. **Phase 4.6**：底部 TabBar + "我的"页面（头像/统计/数据管理/反馈/关于）
7. **Phase 5**：MVP 测试与打磨
8. **Phase 6**：后端搭建 — .NET 10 WebAPI + SQLite + 微信登录
9. **Phase 7**：云端数据同步（本地 ↔ 云端双向同步）
10. **Phase 8**：扩展模板
