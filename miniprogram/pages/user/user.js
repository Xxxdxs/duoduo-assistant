// miniprogram/pages/user/user.js
const {requestCloud} = require('../../utils/tools.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 改成common开头的绝对路径反而可以 /或者./开头则不行
    avatarUrl: 'common/img/user-unlogin.png',
    logged: false,
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  async onGetOpenid() {
    const res = await wx.cloud.callFunction({
      name: 'duoduo',
      data: {
        name: 'login',
        avatar: this.data.userInfo.avatarUrl,
        nickname: this.data.userInfo.nickname
      }
    })
    // 登录以后可以不用再传入其他信息, 因为都保存在数据库了
    wx.setStorageSync('openId', res.result.openid)
    wx.setStorageSync('userId', res.result.userId)
    app.globalData.openId = res.result.openid
  }
  // 好像没有公众号和支付功能获取不到unionid, 反正我也只有一个小程序, 就用openid替代
})