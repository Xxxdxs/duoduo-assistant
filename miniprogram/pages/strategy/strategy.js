// miniprogram/pages/strategy/strategy.js
const { requestCloud } = require('../../utils/tools.js')
const BASE_URL = 'http://xlxlx.xyz:3000/client/api/post/list'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recommendPosts: [],
    beginnerPosts: [],
    advancedPosts: [],
    scrollViewHeight: wx.getStorageSync('ScrollViewHeight')
  },
  onLoad: async function (options) {
    this.fetchPosts()
    const app = getApp();
    console.log(app)
  },

  onReady: function () {

  },

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

  async fetchPosts() {
    const res = await requestCloud('strategy')
    const data = res.result.data
    this.setData({
      recommendPosts: data.find(item => item.name === '推荐').postList,
      beginnerPosts: data.find(item => item.name === '新手攻略').postList,
      advancedPosts: data.find(item => item.name === '进阶攻略').postList
    })
  },

  jumpPage(e) {
    const {postid} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/post/post?id=${postid}`
    })
  }
})
