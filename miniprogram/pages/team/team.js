// miniprogram/pages/team/team.js
const { requestCloud } = require("../../utils/tools.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    teamsList: [],
    teams: [],
    team: {},
    // jibanList: [],
    raceList: [],
    careerList: [],
    tenCountArr: Array.from({ length: 10 }),
    iconBaseUrl: "../../common/img/hero_1",
    breadcrumbIndex: 0,
    breadcrumb: [
      {
        name: "推荐阵容"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getTeamsData();
    this.getJibanList();
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

  async getTeamsData() {
    const res = await requestCloud("teams");
    this.setData({
      teamsList: res.result.data
    });
  },

  clickTeams(e) {
    const { index } = e.currentTarget.dataset;
    const { breadcrumb, teams } = this.data;
    breadcrumb.push({
      name: this.data.teamsList[index].name
    });

    this.setData({
      teams: this.data.teamsList[index],
      breadcrumbIndex: 1,
      breadcrumb
    });
  },

  clickTeam(e) {
    const { index } = e.currentTarget.dataset;
    const { breadcrumb, team } = this.data;
    breadcrumb.push({
      name: this.data.teams.teamList[index].name
    });
    this.setData({
      team: this.data.teams.teamList[index],
      breadcrumbIndex: 2,
      breadcrumb
    });
  },

  clickBread(e) {
    const { index } = e.currentTarget.dataset;
    let { breadcrumb } = this.data;
    breadcrumb = breadcrumb.slice(0, index + 1);
    this.setData({
      breadcrumb,
      breadcrumbIndex: breadcrumb.length - 1
    });
  },

  jumpHeroPage(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/hero/hero?id=${id}`
    });
  },

  /**
   * jibanList由职业和种族数据算出
   */
  async getJibanList() {
    const careerRes = await requestCloud("careers");
    const raceRes = await requestCloud("races");
    const careerList = careerRes.result.data;
    const raceList = raceRes.result.data;
    // const jibanList = [
    //   ...raceList.map(el => ({ name, icon: el.ethnicPattern, skills: el.skills })),
    //   ...careerList.map(el => ({ name, icon: el.careerImg, skills: el.skills }))
    // ];
    this.setData({
      raceList,
      careerList
    });
  }
});
