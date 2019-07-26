//app.js
App({
  globalData: {
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // cloud-prod-yg88k cloud-dev-0f318b
        // 此处请填入环境 ID, 环境 ID 可打开云控制台查看
        env: 'cloud-dev-0f318b',
        traceUser: true,
      })
    }

    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
        this.globalData.ScrollViewHeight = e.windowHeight - this.globalData.CustomBar - 34
      }
    })
  },
  get(url) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        success(res) {
          resolve(res)
        },
        fail(err) {
          reject(err)
        }
      })
    })
  },
  async getOpenId() {
    // globalData中存在
    if (this.globalData.openId) {
      return this.globalData.openId
    }
    const openId = wx.getStorageSync('openId')
    if (openId) {
      this.globalData.openId = openId
      return openId
    } else {
      const res = await wx.cloud.callFunction({
        name: 'duoduo',
        data: {
          name: 'login'
        }
      })
      const openid = res.openid
      wx.setStorageSync('openId', openid)
      this.globalData.openId = openid

      return openid
    }
  },
  async getUserId() {
    // globalData中存在
    if (this.globalData.userId) {
      return this.globalData.userId
    }
    const userId = wx.getStorageSync('userId')
    if (userId) {
      this.globalData.userId = userId
      return userId
    } else {
      const res = await wx.cloud.callFunction({
        name: 'duoduo',
        data: {
          name: 'login'
        }
      })
      const userId = res.result.userId
      wx.setStorageSync('userId', userId)
      this.globalData.userId = userId

      return userId
    }
  }
})
