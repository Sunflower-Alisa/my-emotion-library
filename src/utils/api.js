// 开发环境指向本地后端，生产环境改为服务器地址
const BASE_URL = 'http://localhost:5001/api'
const TOKEN_KEY = 'heartnote_token'

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync(TOKEN_KEY) || ''
    const header = { 'Content-Type': 'application/json' }
    if (token) header['Authorization'] = `Bearer ${token}`
    uni.request({
      url: `${BASE_URL}${path}`,
      method,
      header,
      data,
      success: (res) => {
        if (res.statusCode === 401) {
          uni.removeStorageSync(TOKEN_KEY)
          reject(new Error('登录已过期，请重新登录'))
        } else if (res.statusCode >= 400) {
          reject(new Error(res.data?.message || '请求失败'))
        } else {
          resolve(res.data)
        }
      },
      fail: (err) => reject(new Error(err.errMsg || '网络错误')),
    })
  })
}

export const api = {
  isLoggedIn() {
    return !!uni.getStorageSync(TOKEN_KEY)
  },

  async login() {
    const { code } = await uni.login()
    const data = await request('POST', '/auth/login', { code })
    uni.setStorageSync(TOKEN_KEY, data.token)
    return data
  },

  logout() {
    uni.removeStorageSync(TOKEN_KEY)
  },

  get(path) { return request('GET', path) },
  post(path, data) { return request('POST', path, data) },
}
