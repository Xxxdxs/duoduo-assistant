// miniprogram/pages/post/post.js
const {requestCloud} = require('../../utils/tools.js')
const BASE_URL = 'http://xlxlx.xyz:3000/client/api'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    post: {},
    sources: [],
    source: {},
    isLike: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // wx.cloud.callFunction({
    //   name: 'duoduo',
    //   data: {
    //     name: 'strategy'
    //   },
    //   success(res) {
    //     self.setData({
    //       post: res.result.data[0].body
    //     })
    //   }
    // })
    
    // wx.request({
    //   url: BASE_URL + self.options.id,
    //   success(res) {
    //     self.setData({
    //       post: res.data
    //     })
    //   }
    // })
    await Promise.all([this.fetchPost(options.id), this.fetchSources(), app.getUserId()])
    this.getSource(this.data.post, this.data.sources)
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

  async fetchSources() {
    const res = await requestCloud('getSources')
    this.setData({
      sources: res.result.data
    })
  },

  async fetchPost(id) {
    const app = getApp();
    const res = await requestCloud('getPostById', {
      postId: id
    }, app)
    this.setData({
      post: res.result.data
    })
  },

  getSource(post, sources) {
    const source = sources.find(el => el._id === post.source)
    this.setData({
      source
    })
  },

  async collectPost() {
    const app = getApp();
    wx.showLoading({
      title: '请求中...',
    })
    const res = await requestCloud('setCollectitonById', {postId: this.data.post._id}, app)
    wx.hideLoading()
    if (res.result.data.ok) {
      this.setData({
        post: { ...this.data.post, isCollected: !this.data.post.isCollected }
      })
      wx.showToast({
        title: '成功加入收藏'
      })
    } else {
      wx.showToast({
        title: '失败'
      })
    }

  },

  onTapLike() {
    this.setData({
      isLike: !this.data.isLike
    })
  }
})
