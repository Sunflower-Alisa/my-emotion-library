<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useEmotionStore } from '@/store'
import emailConfig from '@/config/email'
import { api } from '@/utils/api'

const store = useEmotionStore()
const stats = ref({ totalDays: 0, totalRecords: 0 })
const feedbackText = ref('')
const activeSection = ref('')
const user = ref(null)
const loggingIn = ref(false)

const APP_VERSION = '1.0.0'

onShow(() => {
  stats.value = store.getStats()
  if (api.isLoggedIn()) {
    api.get('/auth/me').then(data => {
      user.value = data
    }).catch(() => {
      user.value = null
    })
  }
})

async function handleLogin() {
  loggingIn.value = true
  try {
    const data = await api.login()
    user.value = data.user
    uni.showToast({ title: '登录成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: e.message, icon: 'none' })
  } finally {
    loggingIn.value = false
  }
}

function handleLogout() {
  api.logout()
  user.value = null
  uni.showToast({ title: '已退出登录', icon: 'none' })
}

function toggleSection(name) {
  activeSection.value = activeSection.value === name ? '' : name
}

// 导出
function exportData() {
  const json = store.exportData()
  const fs = uni.getFileSystemManager()
  const fileName = `emotion_backup_${Date.now()}.json`
  try {
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
    fs.writeFileSync(filePath, json, 'utf8')
    uni.showModal({
      title: '导出成功',
      content: `文件已保存\n${filePath}\n\n建议通过微信文件传输助手转发到电脑保存。`,
      confirmText: '我知道了'
    })
  } catch {
    uni.setClipboardData({
      data: json,
      success: () => uni.showToast({ title: '导出失败，数据已复制到剪贴板', icon: 'none' })
    })
  }
}

// 导入
function importData() {
  const fs = uni.getFileSystemManager()

  function pickFromChat() {
    try {
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        success: (res) => {
          const file = res.tempFiles[0]
          if (!file.name.endsWith('.json')) {
            uni.showToast({ title: '请选择 .json 文件', icon: 'none' })
            return
          }
          const content = fs.readFileSync(file.path, 'utf8')
          importFromContent(content)
        },
        fail: () => {
          uni.showToast({ title: '已取消', icon: 'none' })
        }
      })
    } catch {
      uni.showToast({ title: '当前环境不支持选择文件', icon: 'none' })
    }
  }

  function importFromContent(content) {
    const result = store.importData(content)
    if (result.success) {
      stats.value = store.getStats()
      uni.showToast({ title: `导入了 ${result.imported} 条记录`, icon: 'success' })
    } else {
      uni.showToast({ title: '文件格式无效', icon: 'none' })
    }
  }

  function pickFromBackup(files) {
    const items = files.map((f, i) => `${i + 1}. ${f.name}`)
    uni.showActionSheet({
      itemList: items.concat(['从聊天文件选择']),
      success: (res) => {
        if (res.tapIndex < files.length) {
          const content = fs.readFileSync(files[res.tapIndex].path, 'utf8')
          importFromContent(content)
        } else {
          pickFromChat()
        }
      }
    })
  }

  try {
    const dirPath = wx.env.USER_DATA_PATH
    const allFiles = fs.readdirSync(dirPath)
    const backups = allFiles
      .filter(name => name.startsWith('emotion_backup_') && name.endsWith('.json'))
      .map(name => ({ name, path: `${dirPath}/${name}` }))
      .sort((a, b) => b.name.localeCompare(a.name))

    if (backups.length > 0) {
      pickFromBackup(backups)
    } else {
      uni.showModal({
        title: '无本地备份',
        content: '没有找到本地备份文件，将打开聊天窗口选择文件？',
        success: (res) => { if (res.confirm) pickFromChat() }
      })
    }
  } catch {
    pickFromChat()
  }
}

// 反馈
function submitFeedback() {
  const text = feedbackText.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }

  function done() {
    feedbackText.value = ''
    uni.showToast({ title: '感谢反馈！', icon: 'success' })
  }

  function fallback(msg) {
    if (emailConfig.pushplus.enabled && emailConfig.pushplus.token) {
      uni.request({
        url: emailConfig.pushplus.url,
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        data: { token: emailConfig.pushplus.token, title: '心迹手账 - 用户反馈', content: text },
        success: () => done(),
        fail: () => fallbackClipboard(text)
      })
    } else {
      fallbackClipboard(text)
    }
  }

  function fallbackClipboard(content) {
    uni.setClipboardData({
      data: `反馈内容：${content}\n发送至：1150042970@qq.com`,
      success: () => {
        feedbackText.value = ''
        uni.showToast({ title: '发送失败，内容已复制到剪贴板', icon: 'none', duration: 3000 })
      }
    })
  }

  if (emailConfig.formsubmit.enabled) {
    uni.request({
      url: emailConfig.formsubmit.url,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: {
        _subject: '心迹手账 - 用户反馈',
        message: text,
        _captcha: false
      },
      success: (res) => {
        if (res.statusCode === 200) {
          done()
        } else {
          fallback('formsubmit 状态码异常')
        }
      },
      fail: () => {
        fallback('formsubmit 请求失败')
      }
    })
  } else {
    fallback('formsubmit 未启用')
  }
}
</script>

<template>
  <view class="container">
    <!-- 用户信息 -->
    <view class="user-section">
      <view class="avatar">
        <text class="avatar-text">{{ user?.avatarUrl ? '' : '📚' }}</text>
        <image v-if="user?.avatarUrl" :src="user.avatarUrl" class="avatar-img" />
      </view>
      <text v-if="user" class="nickname">{{ user.nickname || '心迹手账' }}</text>
      <text v-else class="nickname">心迹手账</text>
      <text class="subtitle">记录情绪，了解自己</text>
      <button v-if="!user" class="login-btn" :disabled="loggingIn" @tap="handleLogin">
        {{ loggingIn ? '登录中...' : '微信一键登录' }}
      </button>
      <button v-else class="logout-btn" @tap="handleLogout">退出登录</button>
    </view>

    <!-- 数据统计 -->
    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-num">{{ stats.totalDays }}</text>
        <text class="stat-label">累计记录天数</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ stats.totalRecords }}</text>
        <text class="stat-label">总记录条数</text>
      </view>
    </view>

    <!-- 可折叠区块 -->
    <view class="collapse-card">
      <view class="collapse-header" @tap="toggleSection('data')">
        <text class="collapse-icon">💾</text>
        <text class="collapse-title">数据管理</text>
        <text class="collapse-arrow">{{ activeSection === 'data' ? '▲' : '▼' }}</text>
      </view>
      <view v-if="activeSection === 'data'" class="collapse-body">
        <view class="action-row" @tap="exportData">
          <text class="action-icon">📤</text>
          <text class="action-title">导出数据</text>
          <text class="action-desc">将情绪记录保存为 JSON 文件到本设备</text>
        </view>
        <view class="action-row" @tap="importData">
          <text class="action-icon">📥</text>
          <text class="action-title">导入数据</text>
          <text class="action-desc">从备份的 JSON 文件恢复记录</text>
        </view>
        <view class="action-row">
          <text class="action-icon">🔒</text>
          <text class="action-title">数据存储说明</text>
          <text class="action-desc">所有数据仅保存在本设备中，卸载小程序会导致数据丢失。建议定期导出备份。</text>
        </view>
      </view>
    </view>

    <view class="collapse-card">
      <view class="collapse-header" @tap="toggleSection('feedback')">
        <text class="collapse-icon">💬</text>
        <text class="collapse-title">反馈建议</text>
        <text class="collapse-arrow">{{ activeSection === 'feedback' ? '▲' : '▼' }}</text>
      </view>
      <view v-if="activeSection === 'feedback'" class="collapse-body">
        <textarea
          v-model="feedbackText"
          class="feedback-input"
          placeholder="写下你的建议或吐槽…我们会认真阅读每一条反馈"
          maxlength="1000"
        />
        <text class="char-count">{{ feedbackText.length }}/1000</text>
        <button class="btn-primary" @tap="submitFeedback">提交反馈</button>
      </view>
    </view>

    <view class="collapse-card">
      <view class="collapse-header" @tap="toggleSection('about')">
        <text class="collapse-icon">📖</text>
        <text class="collapse-title">关于我们</text>
        <text class="collapse-arrow">{{ activeSection === 'about' ? '▲' : '▼' }}</text>
      </view>
      <view v-if="activeSection === 'about'" class="collapse-body">
        <view class="about-item">
          <text class="about-label">版本号</text>
          <text class="about-value">{{ APP_VERSION }}</text>
        </view>
        <view class="about-item">
          <text class="about-label">数据存储</text>
          <text class="about-value">本地存储（仅限本设备）</text>
        </view>
        <view class="about-item">
          <text class="about-label">隐私说明</text>
          <text class="about-value">你的情绪数据只保存在你的设备上，我们不会收集或上传任何个人信息。</text>
        </view>
      </view>
    </view>

    <view class="footer-space"></view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: $spacing-lg $spacing-md;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-lg 0;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.avatar-text {
  font-size: 56rpx;
}

.nickname {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
}

.subtitle {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

.login-btn {
  margin-top: $spacing-md;
  background: linear-gradient(135deg, #07C160, #06AD56);
  color: #fff;
  border-radius: $radius-xl;
  padding: 16rpx 48rpx;
  font-size: $font-md;
  border: none;
}

.login-btn[disabled] {
  opacity: 0.6;
}

.logout-btn {
  margin-top: $spacing-md;
  background: transparent;
  color: $text-light;
  border: 1rpx solid $border-color;
  border-radius: $radius-xl;
  padding: 12rpx 36rpx;
  font-size: $font-sm;
}

.avatar-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.stats-section {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.stat-card {
  flex: 1;
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  text-align: center;
  box-shadow: $shadow-sm;
}

.stat-num {
  font-size: 56rpx;
  font-weight: 700;
  color: $primary-dark;
  display: block;
}

.stat-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: $spacing-xs;
  display: block;
}

.collapse-card {
  background: $card-bg;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-md;
  overflow: hidden;
}

.collapse-header {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
}

.collapse-icon {
  font-size: 40rpx;
}

.collapse-title {
  flex: 1;
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
}

.collapse-arrow {
  font-size: 28rpx;
  color: $text-light;
}

.collapse-body {
  padding: 0 $spacing-lg $spacing-lg;
  border-top: 1rpx solid $border-color;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $border-color;
}

.action-row:last-child {
  border-bottom: none;
}

.action-icon {
  font-size: 36rpx;
  flex-shrink: 0;
}

.action-title {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
}

.action-desc {
  width: 100%;
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.5;
}

.feedback-input {
  width: 100%;
  min-height: 200rpx;
  background: #FDF8F5;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  padding: $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
  line-height: 1.6;
  margin-top: $spacing-md;
}

.char-count {
  font-size: $font-sm;
  color: $text-light;
  display: block;
  text-align: right;
  margin-top: $spacing-xs;
  margin-bottom: $spacing-sm;
}

.btn-primary {
  width: 100%;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: #fff;
  border-radius: $radius-xl;
  padding: 20rpx;
  font-size: $font-lg;
  text-align: center;
  border: none;
}

.about-item {
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $border-color;
}

.about-item:last-child {
  border-bottom: none;
}

.about-label {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-xs;
}

.about-value {
  font-size: $font-sm;
  color: $text-secondary;
  display: block;
  line-height: 1.6;
}

.footer-space {
  height: 40rpx;
}
</style>
