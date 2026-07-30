# 心迹手账 (HeartNote)

> 温暖治愈系的情绪记录工具 — 微信小程序

基于 CBT（认知行为疗法）的情绪日记小程序，帮助你觉察、记录和管理情绪。

## 项目结构

```
my-emotion-library/
├── src/                          # 前端源码 (uni-app + Vue 3)
│   ├── main.js                   # 应用入口 (Pinia)
│   ├── App.vue                   # 根组件
│   ├── uni.scss                  # 全局样式变量
│   ├── pages.json                # 页面路由 & tabBar 配置
│   ├── manifest.json             # uni-app 配置
│   ├── pages/                    # 页面
│   │   ├── index/index.vue       # 首页 — 今日概览、周趋势、快捷入口
│   │   ├── profile/profile.vue   # 我的 — 统计、数据管理、反馈、关于
│   │   ├── record/record.vue     # 记录 — 模板选择
│   │   ├── quick-record/quick-record.vue  # 极速记录
│   │   ├── history/history.vue   # 历史 — 日历/列表双视图、筛选
│   │   └── intro/intro.vue       # 功能介绍
│   ├── components/templates/
│   │   └── BurnsFiveColumn.vue   # 伯恩斯5栏情绪日志模板
│   ├── store/index.js            # Pinia 状态管理
│   ├── constants/emotions.js     # 10种情绪标签常量
│   ├── config/email.js           # 邮件推送配置
│   └── utils/
│       ├── storage.js            # 存储工具封装
│       └── api.js                # 后端 API 调用模块
├── backend/                      # 后端 ( .NET 10 WebAPI )
│   ├── HeartNote.slnx
│   └── HeartNote.Api/
│       ├── Program.cs            # 入口 + 服务注册
│       ├── Controllers/AuthController.cs  # 微信登录接口
│       ├── Services/             # 微信认证 & JWT
│       ├── Data/AppDbContext.cs  # EF Core + SQLite
│       └── ...
├── tests/                        # Vitest 单元测试
│   ├── setup.js
│   ├── store/index.test.js       # Store 测试 (38 用例)
│   └── constants/emotions.test.js # 情绪常量测试 (6 用例)
├── scripts/patch-uni-app.js      # uni-app 兼容补丁
├── dist/build/mp-weixin/         # 构建输出 (微信小程序)
├── vite.config.js                # Vite 构建配置
└── vitest.config.js              # Vitest 测试配置
```

## 功能

| 功能 | 说明 |
|------|------|
| 情绪标签 | 10 种预设情绪，带 emoji 和配色 |
| 伯恩斯5栏日志 | CBT 结构化情绪记录模板（情境→自动思维→认知扭曲→理性回应→结果） |
| 极速记录 | 10 秒快速记录情绪 |
| 情绪日历 | 月度日历，颜色标记每日主导情绪 |
| 周趋势 | 近 7 天平均情绪评分柱状图 |
| 历史筛选 | 按日期筛选查看历史记录 |
| 数据管理 | JSON 导入/导出本地数据 |
| 反馈建议 | 表单转邮件反馈 |
| 微信登录 | 后端 JWT + jscode2session |
| 云端同步 | (开发中) 本地 ↔ SQLite 双向同步 |

## 快速开始

```bash
# 安装依赖
npm install

# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# 构建
npm run build:h5          # H5 构建
npm run build:mp-weixin   # 微信小程序构建

# 测试
npm test
```

## 后端运行

```bash
cd backend/HeartNote.Api
# 配置 appsettings.json 中的 WeChat:Secret
dotnet run
# 默认监听 https://localhost:5001
```

## 技术栈

- **前端**: uni-app (Vue 3) + Vite + Pinia
- **后端**: .NET 10 WebAPI + EF Core + SQLite
- **认证**: 微信登录 (jscode2session) + JWT
- **测试**: Vitest (44 用例全部通过)
- **UI**: 温暖治愈风 (暖杏色 #E8A87C)

## 测试状态

```bash
npm test
> 44 tests passed (store: 38, constants: 6)
```

## 许可证

MIT
