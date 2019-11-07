// miniprogram/pages/post/post.js
const {requestCloud} = require('../../utils/tools.js')
const { format } = require('../../common/js/timeago.min.js')

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    post: {},
    sources: [],
    source: {},
    pastTimeText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
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
    const res = await requestCloud('getPostById', {
      postId: id
    }, app, false)
    this.setData({
      post: res.result.data,
    })
    this.calcPastTimeText()
  },

  getSource(post, sources) {
    const source = sources.find(el => el._id === post.source)
    this.setData({
      source
    })
  },

  async collectPost() {
    const res = await requestCloud('setCollectitonById', {postId: this.data.post._id}, app)
    wx.hideLoading()
    if (res.result.data.ok) {
      this.setData({
        post: { ...this.data.post, isCollected: !this.data.post.isCollected }
      })
      if (this.data.post.isCollected) {
        wx.showToast({
          title: '已收藏'
        })
      } else {
        wx.showToast({
          title: '已取消收藏'
        })
      }
    } else {
      wx.showToast({
        title: '失败'
      })
    }
  },

  async onTapLike() {
    // 点赞用户的点赞列表+1
    // 后端查询点赞列表，isLike字段
    // 文章的点赞数+1
    const res = await requestCloud('setLikeById', { postId: this.data.post._id }, app)
    if (res.result.data.ok) {
      this.setData({
        post: { ...this.data.post, isLiked: !this.data.post.isLiked }
      })
      if (this.data.post.isLiked) {
        wx.showToast({
          title: '谢谢支持'
        })
      } else {
        wx.showToast({
          title: '亲，别这样'
        })
      }
    } else {
      wx.showToast({
        title: 'oops点赞失败'
      })
    }
  },

  calcPastTimeText() {
    this.setData({
      pastTimeText: format(this.data.post.createdAt, 'zh_CN')
    })
  },

  showStatement(source) {
    this.setData({
      show: true
    })
  }
})
