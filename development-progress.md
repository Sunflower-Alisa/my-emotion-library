# 心迹手账 — 开发进度记录

> 记录每次对话的开发进展、决策和 TODO

## 当前状态

| 阶段 | 状态 |
|---|---|
| 需求梳理 | ✅ 已完成 |
| 技术方案 | ✅ 已确定 |
| 项目初始化 | ✅ 已完成 |
| 伯恩斯5栏模板 | ✅ 已完成 |
| 本地存储层 | ✅ 已完成 |
| 历史记录查看 | ✅ 已完成 |
| 情绪标签系统 | ✅ 已完成 |
| 极速记录 | ✅ 已完成 |
| 情绪日历 | ✅ 已完成 |
| 日期筛选 | ✅ 已完成 |
| 功能介绍页 | ✅ 已完成 |
| 周情绪趋势 | ✅ 已完成 |
| Bug 修复 | ✅ 已完成 |
| 底部 TabBar | ✅ 已完成 |
| "我的"页面 | ✅ 已完成 |
| Bug 修复 | ✅ 已完成 |
| 后端 API (.NET + SQLite) | ✅ 已完成 |
| 微信登录集成 | ✅ 已完成 |

## 项目文件结构

```
my-emotion-library/
├── package.json                  # 项目配置
├── vite.config.js                # Vite 配置 (含 @ 别名)
├── index.html                    # H5 入口
├── project-plan.md               # 项目计划书
├── development-progress.md       # 开发进度记录
├── scripts/
│   └── patch-uni-app.js          # uni-app 兼容补丁（postinstall 自动执行）
├── src/
│   ├── manifest.json             # uni-app 配置
│   ├── pages.json                # 页面路由
│   ├── main.js                   # 应用入口 (Pinia)
│   ├── App.vue                   # 根组件
│   ├── uni.scss                  # 全局样式变量 (温暖治愈风)
│   ├── constants/
│   │   └── emotions.js           # 情绪标签常量 (10种)
│   ├── config/
│   │   └── email.js              # 邮件推送配置
│   ├── store/index.js            # Pinia 状态管理
│   ├── utils/
│   │   ├── storage.js            # 存储工具封装
│   │   └── api.js                # 后端 API 调用模块
│   ├── pages/
│   │   ├── index/index.vue       # 首页 (周情绪趋势)
│   │   ├── profile/profile.vue   # "我的"页面 (统计/登录/管理/反馈/关于)
│   │   ├── record/record.vue     # 记录页 (伯恩斯5栏)
│   │   ├── quick-record/quick-record.vue  # 极速记录页
│   │   ├── history/history.vue   # 历史页 (日历/列表/筛选)
│   │   └── intro/intro.vue       # 功能介绍页
│   ├── components/
│   │   └── templates/
│   │       └── BurnsFiveColumn.vue  # 伯恩斯5栏模板 (含情绪标签)
│   └── dist/
│       └── build/mp-weixin/      # 微信小程序构建输出
├── backend/                      # .NET WebAPI 后端
│   ├── HeartNote.slnx            # 解决方案文件
│   └── HeartNote.Api/
│       ├── Program.cs            # 入口 + 服务注册
│       ├── appsettings.json      # 配置 (微信 AppId/Secret, JWT, SQLite)
│       ├── Controllers/
│       │   └── AuthController.cs # 登录/认证接口
│       ├── Models/
│       │   └── User.cs           # 用户实体
│       ├── Data/
│       │   └── AppDbContext.cs   # EF Core 数据上下文 (SQLite)
│       ├── Dtos/
│       │   └── AuthDtos.cs       # 请求/响应 DTO
│       └── Services/
│           ├── IWeChatAuthService.cs  # 微信认证接口
│           └── WeChatAuthService.cs   # 微信 jscode2session + JWT 实现
└── tests/                        # 单元测试
    ├── setup.js
    ├── store/
    │   └── index.test.js
    └── constants/
        └── emotions.test.js
```

## 决策记录

| 日期 | 决策 | 备注 |
|---|---|---|
| - | 技术栈：uni-app (Vue 3) + Vite + Pinia | |
| - | 首个模板：伯恩斯5栏情绪日志（CBT 疗法） | |
| - | UI风格：温暖治愈风（暖杏色主色调） | |
| - | 数据：MVP 本地存储 uni.setStorageSync | |
| - | 情绪记录：以情绪为主题，一天可多次 | |
| - | 10种认知扭曲全部展示 | |
| - | 10种情绪标签：开心/平静/悲伤/愤怒/焦虑/恐惧/惊喜/疲惫/困惑/感激 | |
| - | 极速记录和伯恩斯5栏共用同一 store 和 records 数据 | |
| - | 情绪日历以月度为单位，按日展示 dominant emotion 颜色 | |
| - | 周趋势展示近7天平均情绪评分 + 最频繁情绪 emoji |
| - | 情绪日历 flexbox 布局替代 CSS grid | 兼容微信小程序渲染限制 |
| - | 主页3列快捷入口（极速记录/详细记录/历史记录） | 极速记录独立入口 |
| - | 介绍页导航使用 uni.reLaunch 替代 uni.switchTab | switchTab 仅支持 tabBar 页面 |
| - | 情绪日历内联到 history.vue（移除独立组件） | 分离组件在 mini-program `v-if` 动态渲染时失败 |
| - | 周趋势按周一~周日顺序 | `getWeeklyStats` 计算当前自然周而非最近7天 |
| - | 底部 TabBar（主页+我的） | 使用 uni-app tabBar 配置，两标签切换 |
| - | "我的"页面（头像/统计/管理/反馈/关于） | 纯前端 MVP，数据本地存储 | |
| 2026-06-22 | 后端技术栈：.NET 10 WebAPI + SQLite + JWT | 腾讯云服务器部署 |
| 2026-06-22 | 微信登录：jscode2session 换取 openid，JWT 鉴权 | 前端 uni.login → 后端 /api/auth/login |
| 2026-06-22 | API 前端模块：src/utils/api.js | Promise 封装 uni.request + token 管理 |

## 已实现功能

### 首页 (index)
- 显示今日日期和星期
- 今日心情概览卡片（渐变背景 + 情绪 emoji）
- 功能介绍入口
- 快捷入口：极速记录 ⚡ / 详细记录 ✏️ / 历史记录 📖（3列卡片布局）
- **周情绪趋势柱状图**（近7天，柱高=平均评分，颜色=情绪配色）
- 今日已有记录列表预览（含情绪 emoji）

### 伯恩斯5栏模板 (BurnsFiveColumn)
- **顶部情绪标签选择器**（10种情绪，emoji+颜色，选中放大效果）
- 5步分步引导式填写（进度条指示）
- 每栏配有填写引导说明（橘色提示框）
- 每栏可展开查看填写示例
- 10种认知扭曲多选标签（附带详细说明）
- 相信度/情绪评分滑块（:value + @change）
- 表单校验（必填项填写后方可继续）
- 底部固定导航：上一步 / 下一步 / 保存

### 记录页 (record)
- 模板选择列表（极速记录 / 伯恩斯5栏）
- 点击"极速记录"跳转至极速记录页
- 点击"伯恩斯5栏"进入模板填写

### 极速记录页 (quick-record)
- 10种情绪标签网格展示
- 选中情绪后有放大高亮效果
- 选中后显示备注输入框
- 底部固定：取消 / 保存按钮
- 一键保存到 store

### 历史页 (history)
- **日历/列表双视图切换**（顶部 tab 切换）
- **情绪日历**（EmotionCalendar 组件）：月度网格，含情绪颜色的日期标记，点击有记录的日期可筛选
- **日期筛选**：`<picker mode="date">` 日期选择器，支持清除筛选
- **空状态**提示
- 按日期分组展示记录
- 每条预览：情绪 emoji + 时间 + 内容摘要 + 情绪评分/标签 + 模板类型
- **删除按钮**（按记录 ID 精确删除，已修复分组删除 bug）
- 底部弹出详情弹窗（scroll-view），支持伯恩斯5栏和极速记录两种详情视图
- **日历视图内联实现**（日历模板+逻辑直接写在 history.vue 中，避免分离组件在 mini-program 中的渲染兼容问题）

### 功能介绍页 (intro)
- 大标题 + 吉祥物图标
- 6大功能卡片（2列网格）
- 引导语引用块
- "开始使用"按钮（使用 uni.reLaunch 导航到首页）

### 情绪标签系统 (emotions.js)
- 10种情绪：开心😊、平静😌、悲伤😢、愤怒😠、焦虑😰、恐惧😨、惊喜😮、疲惫😴、困惑🤔、感激🙏
- 每种标签配有 emoji + 颜色 + 中文标签

### "我的"页面 (profile)
- **用户信息区**：渐变圆形容器 + 📚 emoji + 默认昵称
- **数据统计**：累计记录天数 + 总记录条数（双卡片布局，始终可见）
- **三个可折叠区块**（点击标题展开/收起，同一时间只展开一个）：
  - **💾 数据管理**：
    - 导出数据：`FileSystemManager.writeFileSync` 写入 JSON 到 `wx.env.USER_DATA_PATH`，弹出路径提示
    - 导入数据：`wx.chooseMessageFile` 选择 `.json` 文件，`readFileSync` 读取后调用 `store.importData`
    - 数据存储说明：本地存储，建议定期导出
  - **💬 反馈建议**：
    - 文本输入框 + 提交按钮
    - 提交时通过 `uni.request` POST 到 `formsubmit.co/ajax/1150042970@qq.com`
    - 请求失败则回退到剪贴板（含邮箱地址）
  - **📖 关于我们**：
    - 版本号 1.0.0、本地存储说明、隐私提示

### 本地存储层
- Pinia store 管理情绪记录
- uni.setStorageSync 持久化
- 按日期查询 / 分组 / 删除
- **新增**：极速记录 / 周趋势统计 / 日历数据查询 / 日期范围筛选 / 按日期筛选分组 / 数据统计 / JSON 导入导出 / 反馈本地留存

## 路由与导航

| 页面 | 路由 | 导航方式 | TabBar |
|---|---|---|---|
| 首页 | `/pages/index/index` | 默认 | ✅ |
| 我的 | `/pages/profile/profile` | `switchTab` | ✅ |
| 记录 | `/pages/record/record` | `navigateTo` | |
| 极速记录 | `/pages/quick-record/quick-record` | `navigateTo` | |
| 历史 | `/pages/history/history` | `navigateTo` | |
| 功能介绍 | `/pages/intro/intro` | `navigateTo` | |

## Bug 修复记录

| Bug | 原因 | 修复方案 |
|---|---|---|
| 功能介绍页"开始使用"按钮无反应 | 使用了 `uni.switchTab`，该 API 仅支持 tabBar 页面 | 改为 `uni.reLaunch` |
| 极速记录页备注展示不全 | 固定底部按钮 (`position: fixed`) 遮挡内容区域 | 容器增加 `padding-bottom: 160rpx` |
| 极速记录入口不便触达 | 入口仅在记录页模板选择中 | 主页新增"极速记录"快捷入口卡片（3列布局），并调小内边距适配 |
| 情绪日历组件不显示 | 分离组件在 mini-program 中动态渲染失败 | 将日历模板+逻辑内联到 history.vue，`viewMode` 改用函数 `switchMode()` |
| 周趋势按周一到周日顺序 | `getWeeklyStats` 使用最近7天而非当前自然周 | 改为计算当前周一~周日并遍历 |
| 导出数据不生成实际文件 | 仅复制到剪贴板 | 改用 `FileSystemManager.writeFileSync` 写入 `wx.env.USER_DATA_PATH` |
| 导入数据无法选择文件 | 仅显示提示文字 | 改用 `wx.chooseMessageFile` 选择 `.json` 文件并读取 |
| 反馈建议未发送邮件 | 仅复制邮箱到剪贴板 | 改用 `uni.request` POST 到 formsubmit.co 邮箱服务，失败回退剪贴板 |
| "我的"页面内容平铺过长 | 数据管理/反馈/关于直接展示 | 改为手风琴折叠（`toggleSection`，同一时间只展开一个） |

## 测试

| 文件 | 用例数 | 状态 |
|---|---|---|
| `tests/store/index.test.js` | 38 | ✅ 全部通过 |
| `tests/constants/emotions.test.js` | 6 | ✅ 全部通过 |

运行：`npm test`（Vitest v2）

测试覆盖：loadRecords / saveRecord / saveQuickRecord / deleteRecord / getTodayRecords / getGroupedRecords / getWeeklyStats / getCalendarData / getStats / exportData / importData + 各边界情况（空数据、损坏数据、ID 去重、缺失字段等）

## 构建验证

| 平台 | 状态 |
|---|---|
| H5 (`vite build`) | ✅ 通过 |
| 微信小程序 (`uni build -p mp-weixin`) | ✅ 通过 |
| 单元测试 (`npm test`) | ✅ 44/44 通过 |

构建输出目录：`dist/build/mp-weixin`

## 已知的技术适配

1. @dcloudio/uni-app 的 ESM 构建包引用了 Vue 内部 API (`isInSSRComponentSetup`)
   - 解决方案：postinstall 脚本自动修补 `uni-app.es.js`
   - 参见：`scripts/patch-uni-app.js`

2. `<slider>` 组件不支持 `v-model`（uni-app 小程序限制）
   - 解决方案：使用 `:value` + `@change`

3. 小程序 `<picker mode="date">` 返回值通过 `e.detail.value` 获取
   - 历史页日期筛选使用此方式

4. CSS `grid` + `aspect-ratio` 在微信小程序中兼容性不佳
   - 解决方案：情绪日历使用 `flex-wrap` + `14.285%`(1/7) 百分比宽度替代 grid 布局

5. `uni.switchTab` 仅支持 tabBar 页面
   - 非 tabBar 页面应使用 `uni.reLaunch` 或 `uni.navigateTo` 进行导航

6. 微信小程序文件读写：
   - 写文件：`FileSystemManager.writeFileSync(path, data, 'utf8')`，路径使用 `wx.env.USER_DATA_PATH`
   - 读文件：`FileSystemManager.readFileSync(path, 'utf8')`
   - 文件选择：`wx.chooseMessageFile` 从微信聊天中选择文件

7. `formsubmit.co` 免费表单转邮件服务：
   - POST 到 `https://formsubmit.co/ajax/邮箱地址`
   - 无需注册，适合 MVP 阶段使用
   - 小程序需配置 `request` 合法域名

8. 微信开发者工具存在缓存机制，修改文件后需：
   - 清除编译缓存（工具栏 → 清除 → 清除全部缓存）
   - 或删除项目后重新导入 `dist/build/mp-weixin`

## 测试文件

```
tests/                    # 单元测试
├── setup.js              # 测试环境配置（mock uni API）
├── store/
│   └── index.test.js     # Pinia store 测试（38 用例）
└── constants/
    └── emotions.test.js  # 情绪常量测试（6 用例）
```

## 后端部署说明

### 开发运行

```bash
cd backend/HeartNote.Api
# 配置 appsettings.json 中的 WeChat:Secret
dotnet run
# 默认监听 https://localhost:5001
```

### 部署到腾讯云

1. 使用 `dotnet publish` 发布
2. 上传到腾讯云服务器（Linux/Windows）
3. 配置反向代理（Nginx / IIS）
4. 在 `appsettings.json` 中配置:
   - `WeChat:Secret` - 从微信公众平台获取
   - `ConnectionStrings:Default` - SQLite 路径
5. 修改 `src/utils/api.js` 的 `BASE_URL` 为目标服务器地址
6. 小程序后台配置 `request` 合法域名指向服务器地址

## TODO

- [x] 在 `manifest.json` 填写微信小程序 AppID
- [x] 单元测试框架搭建 + 44 条测试用例
- [x] .NET WebAPI 后端 + 微信登录
- [ ] 填写 `appsettings.json` 的 `WeChat:Secret`
- [ ] 配置小程序 request 合法域名
- [ ] 部署后端到腾讯云服务器
- [ ] 在微信开发者工具中打开 `dist/build/mp-weixin` 预览
- [ ] 替换 tabBar 图标（目前为纯文字）
- [ ] 接入真实邮件发送 API（反馈功能）
- [ ] MVP 功能测试与打磨
- [ ] 后续模板扩展
- [ ] 云端数据迁移
