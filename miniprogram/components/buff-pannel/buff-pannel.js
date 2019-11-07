// components/buff-pannel/buff-pannel.js
const { getJibansComputed } = require("../../utils/tools.js");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    heroList: {
      type: Array,
      value: []
    },
    raceList: {
      type: Array,
      value: []
    },
    careerList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    jibansComputed: []
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
      this.getJibansComputed();
    },
    moved: function() {},
    detached: function() {}
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {},
    hide: function() {},
    resize: function() {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getJibansComputed() {
      const jibanList = getJibansComputed(
        this.data.raceList,
        this.data.careerList,
        this.data.heroList
      );
      this.setData({
        jibansComputed: jibanList
      });
    }
  },

  observers: {
    "heroList.**, raceList.**, careerList.**": function(heroList) {
      this.getJibansComputed();
    }
  }
});
