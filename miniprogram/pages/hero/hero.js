// miniprogram/pages/hero/hero.js
const { requestCloud } = require("../../utils/tools.js");
const qualityList = require("../../common/js/quality.js");
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showupVoice: [],
    hero: {},
    careerList: [],
    raceList: [],
    qualityList: qualityList,
    // 不同于vue， 即使不在data上声明初始值，直接setData也能响应式
    a: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.fetchHero(options.id);
    this.setData({
      careerList: app.globalData.careerList,
      raceList: app.globalData.raceList
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},

  async fetchHero(id) {
    const res = await requestCloud("getHeroById", {
      id
    });
    this.setData({
      hero: this.handleHeroData(res.result.data)
    });
  },

  playVoice(e) {
    const { src } = e.currentTarget.dataset;
    const audioContext = wx.createInnerAudioContext();
    audioContext.autoplay = true;
    audioContext.src = src;
    audioContext.onPlay(() => {
      console.log("开始播放");
    });
    audioContext.onError(res => {
      console.log(res.errMsg);
    });
  },

  async downloadVoice(e) {
    const { src } = e.currentTarget.dataset;
    console.log(src);
    const res = await wx.cloud.downloadFile({
      fileID: src
    });
    wx.saveFile({
      tempFilePath: res.tempFilePath,
      success(res) {
        const saveFilePath = res.savedFilePath;
        wx.showToast({
          icon: "success",
          title: `下载成功`
        });
      }
    });
  },
  /**
   * 通过品质文字计算成对象，
   * 通过种族职业字符串数组计算对象数组
   */
  handleHeroData(hero) {
    const { careerList, raceList } = app.globalData;
    const cardType =
      hero.cardType &&
      hero.cardType.map(el => {
        const icon = careerList.find(career => career.name === el).careerImg;
        return { name: el, icon };
      });
    const category =
      hero.category &&
      hero.category.map(el => {
        const icon = raceList.find(race => race.name === el).ethnicPattern;
        return { name: el, icon };
      });
    const cardQuality = qualityList.find(el => el.name === hero.cardQuality);
    return { ...hero, cardType, category, cardQuality };
  },

  test() {
    let i = this.data.b || 1;
    i++;
    // 同vue不一样， 不需要在data中定义嵌套属性
    this.setData({
      b: i
    });
  }
});
