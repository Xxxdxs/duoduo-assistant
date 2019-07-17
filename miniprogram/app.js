//app.js
App({
  globalData: {
    name: 'xxx'
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
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
        // page 生命周期获取不到这个?或许是由于几个UI插件的原因?
        this.globalData.ScrollViewHeight = e.windowHeight - this.globalData.CustomBar - 34 // tabs高度
      }
    })
    // attention: !!!!此处暂时处理, 我把所有条件都重新搭了一遍但是就是不复现
    // 在page中无法获取(包括任何生命周期和自定义方法)任何app中的自定义变量和方法.(真机调试和开发工具正常, 真机和预览不正常, 不知是否是BUG)
    // 但我还定义了方法, gg思密达
    wx.setStorageSync('ScrollViewHeight', this.globalData.ScrollViewHeight)
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
