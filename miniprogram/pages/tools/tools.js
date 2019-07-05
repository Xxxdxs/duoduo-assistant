// miniprogram/pages/tools/tools.js
const Wxml2Canvas = require('../../wxml2canvas/index.js')
const {watch, computed} = require('../../utils/vuify')
const {sleep} = require('../../utils/tools')
const {chessBoardCanvasList, createChessBoard} = require('../../common/canvas/chessboard')
const zoom = wx.getSystemInfoSync().windowWidth / 375

Page({

  /**
   * 23_g-WEgAvU-ye1lPjNXckHkXpYek9pxed-dYR5lA7GDIZceWsvvdgA7KQN3k0K61RNKM5Kuut_I_IHNPZtjcvpNg--gkKbzfYmle40Mb03kB31IHasWeuv4Z2WkjW1vVm-fqxErNVmYPgGy8DfVFVaAEABLB
   * 页面的初始数据
   */
  // 如果data中的一个属性值为对象数组,
  // 动态的给这个对象添加属性(this.setData)是没有用的
  data: {
    chessBoardCellsArray: Array.from({ length: 32 }),
    chessGroupArray: Array.from({ length: 10 }),
    chessGroup: [], // 当前阵容
    chessBoardCells: Array.from({length: 10}, () => ({})), // 与chessGroup删除的逻辑不同, 所以分开写
    heroList: [], 
    raceList: [],
    careerList: [],
    qualityList: [],
    // computed方法不能响应式深层属性 这和vue响应式原理一样 以后修改
    filterOptions: {race: '', career: '', quality: ''},
    filterRace: '',
    filterCareer: '',
    filterQuality: '',
    ischessBoardCellClicked: false,
    chessBoardCellClicked: {},
    clickedIndex: -1,
    jibanText: '',
    jibanList: [],
    imgs: [], // Wxml2Canvas用到的
    canvas1: {
      width: 375 * zoom,
      height: 1000 * zoom
    },
    show: false,
    buffTextHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    computed(this, {
      // 当计算属性heroListDisplay的元素的属性值变化时, 是没有响应式的
      heroListDisplay() {
        const {filterRace, filterCareer, filterQuality} = this.data
        return this.data.heroList.filter(el => {
          const raceCondition = !filterRace || Boolean(~el.category.findIndex(el => el === filterRace))
          const careerCondition = !filterCareer || Boolean(~el.cardType.findIndex(el => el === filterCareer))
          const qualityCondition = !filterQuality || el.cardQuality === filterQuality

          return raceCondition && careerCondition && qualityCondition
        })
      }
    })
    // 暂时不能检测异变方法, 等我再看看vue的源码以后再写
    watch(this, {

    })
    await Promise.all([this.getHerosData(), this.getQualityData(), this.getCareerData(), this.getRacesData()])
    this.editHeroList()
    // wx.cloud.downloadFile({
    //   fileID: 'cloud://cloud-dev-0f318b.636c-cloud-dev-0f318b-1257264379/duoduo/hero_1001.png', //仅为示例，并非真实的资源
    //   success (res) {
    //     // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
    //     if (res.statusCode === 200) {
    //       console.log('下载完毕')
    //     }
    //   },
    //   fail(err) {
    //     console.log(err)
    //   }
    // })
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

  async getHerosData() {
    const res = await wx.cloud.callFunction({
      name: 'duoduo',
      data: {
        name: 'heroes'
      }
    })
    const heroList = res.result.data
    heroList.forEach(el => {
      el.isSelected = false
    })
    this.setData({
      heroList
    })
  },

  async getRacesData() {
    const res = await wx.cloud.callFunction({
      name: 'duoduo',
      data: {
        name: 'races'
      }
    })
    this.setData({
      raceList: res.result.data
    })
  },

  async getCareerData() {
    const res = await wx.cloud.callFunction({
      name: 'duoduo',
      data: {
        name: 'careers'
      }
    })
    this.setData({
      careerList: res.result.data
    })
  },

  async getQualityData() {
    const res = await wx.cloud.callFunction({
      name: 'duoduo',
      data: {
        name: 'qualities'
      }
    })
    this.setData({
      qualityList: res.result.data
    })
  },

  editHeroList() {
    const {heroList, qualityList} = this.data
    heroList.forEach(hero => {
      hero.qualityColor = qualityList.find(quality => quality.name === hero.cardQuality).color
    })
    this.setData({
      heroList
    })
  },

  addHero(e) {
    const {chessGroup, heroList, heroListDisplay, chessBoardCells} = this.data
    const index = heroList.findIndex(el => el.name === e.currentTarget.dataset.name)
    const chessGroupIndex = chessGroup.findIndex(el => el.name === e.currentTarget.dataset.name)
    const chessBoardCellIndex = chessBoardCells.findIndex(el => el.name === e.currentTarget.dataset.name)
    const firstEmptyChessIndex = chessBoardCells.findIndex(el => !el.name)
    const isSelected = `heroList[${index}].isSelected`
    // 有问题 firstEmptyChessBoardCellIndex不是真正空缺位置
    // 这么写太怪了..
    let firstEmptyChessBoardCellIndex = 0
    for (const [k, v] of chessBoardCells.entries()) {
      if (~chessBoardCells.findIndex(el => el.sortIndex === k)) {
        firstEmptyChessBoardCellIndex++
      } else {
        break
      }
    }
    // 如果在chessGroup中存在了, 就把他删除, 反之..
    if (~chessGroupIndex) {
      chessGroup.splice(chessGroupIndex, 1)
      chessBoardCells.splice(chessBoardCellIndex, 1, {})
      this.setData({
        [isSelected]: false,
        chessGroup,
        heroListDisplay,
        chessBoardCells
      })
    } else {
      if (chessGroup.length === 10) {
        wx.showToast({
          title: '超过10个棋子啦',
          icon: 'none',
          duration: 1000
        })
        return
      }

      // 已解决 sortIndex不应该直接等于index 
      this.setData({
        [isSelected]: true
      })
      const hero = {...heroList[index], sortIndex: firstEmptyChessBoardCellIndex}
      chessGroup.push(hero)
      // 放置棋盘删除棋子时, 不往前补位, 留下空位, 新加入的棋子按顺序填补空位
      // 加入的位置并非第一个firstEmptyChessBoardCellIndex, firstEmptyChessBoardCellIndex
      // 指的是棋盘空位, 并非棋子数组的空位
      chessBoardCells.splice(firstEmptyChessIndex, 1, hero)
      // 此处chessGroup总是在下次点击后 才开始显示出边框
      // heroListDisplay手动更新
      this.setData({
        chessGroup,
        heroListDisplay,
        chessBoardCells
      })
    }
    this.observeChessGroupChange()
  },

  filterHerosByRace(e) {
    const {race} = e.currentTarget.dataset
    if (race === this.data.filterRace) {
      this.setData({
        'filterRace': ''
      })
    } else {
      this.setData({
        'filterRace': race
      })
    }
  },

  filterHerosByCareer(e) {
    const {career} = e.currentTarget.dataset
    if (career === this.data.filterCareer) {
      this.setData({
        'filterCareer': ''
      })
    } else {
      this.setData({
        'filterCareer': career
      })
    }
  },

  filterHerosByQuality(e) {
    const {quality} = e.currentTarget.dataset
    if (quality === this.data.filterQuality) {
      this.setData({
        'filterQuality': ''
      })
    } else {
      this.setData({
        'filterQuality': quality
      })
    }
  },

  removeChess(e) {
    const {name, index} = e.currentTarget.dataset
    const {heroList, chessGroup, heroListDisplay, chessBoardCells} = this.data
    const chessBoardCellIndex = chessBoardCells.findIndex(el => el.name === name)
    if (!chessGroup.length) {
      wx.showToast({
        title: '点击下方英雄头像添加棋子',
        icon: 'none',
        duration: 1000
      })
      return 
    }
    heroList.forEach(el => {
      if (el.name === name) {
        el.isSelected = false
      }
    })
    chessGroup.splice(index, 1)
    chessBoardCells.splice(chessBoardCellIndex, 1, {})
    this.setData({
      heroList,
      chessGroup,
      heroListDisplay,
      chessBoardCells
    })
    this.observeChessGroupChange()
  },

  clickMoveChess(e) {
    // dataset中的undefined为string
    // name不能用
    const {name, index} = e.currentTarget.dataset
    let {chessBoardCells, ischessBoardCellClicked, chessBoardCellClicked, clickedIndex} = this.data
    // 第一次点击且空点时 不做操作 空点不能以name来判断
    // 虽然在wxml中data-name="undefined" 但是其实等于''
    if (!ischessBoardCellClicked && name === '') {
      return
    }    
    // 第一次点击
    if (!ischessBoardCellClicked) {
      chessBoardCellClicked = chessBoardCells.find(el => el.name === name)
      this.setData({
        ischessBoardCellClicked: !ischessBoardCellClicked,
        clickedIndex: index,
        chessBoardCellClicked
      })
      return
    }

    if (name === '') {
      // 第二次点击时, 且点的空位
      chessBoardCellClicked.sortIndex = index
    } else {
      const curChessBoardCellClicked = chessBoardCells.find(el => el.name === name)
      chessBoardCellClicked.sortIndex = curChessBoardCellClicked.sortIndex
      curChessBoardCellClicked.sortIndex = clickedIndex
    }

    this.setData({
      ischessBoardCellClicked: false,
      chessBoardCells,
      clickedIndex: -1,
      chessBoardCellClicked: {}
    })
    this.observeChessGroupChange()
  },

  deleteChessList() {
    const {heroList, heroListDisplay} = this.data
    heroList.forEach(el => el.isSelected = false)
    this.setData({
      ischessBoardCellClicked: false,
      chessBoardCells: Array.from({length: 10}, () => ({})),
      chessGroup: [],
      clickedIndex: -1,
      chessBoardCellClicked: {},
      heroList,
      filterRace: '',
      filterCareer: '',
      filterQuality: '',
      heroListDisplay
    })
    this.observeChessGroupChange()
  },
  /**
   * 当阵容变化时, 手动修改羁绊, 计算属性更好, 但是数组的变异方法不算setter
   * 等我看了vue源码后再写
   */
  observeChessGroupChange() {
    const {chessGroup, raceList, careerList} = this.data
    // 对象的遍历顺序是没有规范的 所以分开写 种族羁绊在前 职业羁绊在后
    const raceJibanObj = {}
    const careerJibanObj = {}
    let jibanText = ''
    let jibanList = []
    raceList.forEach(race => {
      const sameRaceCount = chessGroup.filter(el => el.category.includes(race.name)).length
      raceJibanObj[race.name] = sameRaceCount
    })
    careerList.forEach(career => {
      const sameRaceCount = chessGroup.filter(el => el.cardType.includes(career.name)).length
      careerJibanObj[career.name] = sameRaceCount
    })

    for(const k in raceJibanObj) {
      const raceSkills = raceList.find(el => el.name === k).skills
      if (raceJibanObj[k]) {
        const _raceSkills = raceSkills.filter((el, i) => el[0] <= raceJibanObj[k])
        if (_raceSkills.length) {
          jibanList.push({name: k, list: _raceSkills})
          const raceJibanText = _raceSkills[_raceSkills.length - 1][0] + k
          jibanText += raceJibanText + ' '
        }
      }
    }

    for(const k in careerJibanObj) {
      const careerSkills = careerList.find(el => el.name === k).skills
      if (careerJibanObj[k]) {
        const _careerSkills = careerSkills.filter((el, i) => el[0] <= careerJibanObj[k])
        if (_careerSkills.length) {
          jibanList.push({name: k, list: _careerSkills})
          const careerJibanText = _careerSkills[_careerSkills.length - 1][0] + k
          jibanText += careerJibanText + ' '
        }
      }
    }

    this.setData({
      jibanText,
      jibanList
    })
  },

  /**
   * 分享图片
   */

  async shareChessBoard() {
    // 有问题 第二次点击报错函数不存在
    setTimeout(() => {
      this.drawImage1()
    }, 200)
  },

  showJibanDetail() {
    this.setData({
      show: true
    })
  },

  onClose() {
    this.setData({ close: false });
  },
  /**
   * 生成图片
   * 不在iphone6上面绘图时, 会产生一点点误差
   * 并且文字换行也有问题
   */
  async drawImage1 () {
    let self = this
    this.CalcBuffTextHeight()
    // wx.createSelectorQuery好像还挺耗时间的, 先暂时处理一下
    await sleep(500)
    const drawImage = new Wxml2Canvas({
        width: 375, // 宽， 以iphone6为基准，传具体数值，其他机型自动适配
        height: 80 + 190 + this.data.buffTextHeight + 10 , // 高
        element: 'canvas1', 
        background: '#ffffff',
        progress (percent) {
          wx.showLoading({
            title: '正在生成图片',
          })
          if (percent === 100) {
            wx.hideLoading()
          }
        },
        finish(url) {
          let imgs = self.data.imgs;
          imgs.push(url);

          self.setData({
            imgs
          })

          // wx.previewImage({
          //   current: current, // 当前显示图片的http链接  
          //   urls: this.data.imglist // 需要预览的图片http链接列表  
          // })
          setTimeout(() => {
            wx.saveImageToPhotosAlbum({
              filePath: url,
              success(result) {
                wx.showToast({
                  title: '图片保存成功',
                  icon: 'success',
                  duration: 2000
                })
              }
            })
          }, 1000)
        },
        error (res) {
          console.log(res)
        }
    })
    let data = {
        list: [
          ...createChessBoard(), {
          type: 'wxml',
          class: '.panel .draw_canvas',
          limit: '.panel',
          x: 27.5,
          y: 25
        }, {
          // buff效果
          type: 'wxml',
          class: '.buff-detail-panel .draw_canvas',
          limit: '.buff-detail-panel',
          x: 27.5,
          y: 190
        }, {
          // 二维码效果
          type: 'image',
            url: '/common/qrcode/qrcode.jpeg',
            // delay: true,
            x: 27.5,
            // 要动态计算的...
            y: 190 + this.data.buffTextHeight,
            style: {
            	width: 80,
              height: 80
          }
        }, {
          // 介绍文本
          type: 'text',
          text: '一直下棋, 一直爽!---多多岛小助手',
          x: 135,
          y: 190 + this.data.buffTextHeight + 20,
          style: {
            fontSize: 10,
              lineHeight: 20,
              color: '#5896d5',
          }
        }, {
          // 介绍文本
          type: 'text',
          text: '长按识别二维码进入小程序',
          x: 135,
          y: 190 + this.data.buffTextHeight + 40,
          style: {
            fontSize: 10,
              lineHeight: 20,
              color: '#5896d5',
          }
        }
      ]
    }

    drawImage.draw(data);
  },

  CalcBuffTextHeight() {
    const self = this
    wx.createSelectorQuery().select('.buff-detail-panel').fields({
      size: true
    }, function(res) {
      self.setData({
        buffTextHeight: res.height
      })
    }).exec()
  },

  onClick() {
    // wx.canvasToTempFilePath({
    //   canvasId: 'canvas1',
    //   success: function (res) {
    //     console.log(res);
    //     wx.saveImageToPhotosAlbum({
    //       filePath: res.tempFilePath,
    //       success(result) {
    //         wx.showToast({
    //           title: '图片保存成功2',
    //           icon: 'success',
    //           duration: 2000
    //         })
    //       }
    //     })
      
    // }})
    // wx.request({
    //   url: 'https://api.weixin.qq.com/wxa/getwxacode?access_token=23_g-WEgAvU-ye1lPjNXckHkXpYek9pxed-dYR5lA7GDIZceWsvvdgA7KQN3k0K61RNKM5Kuut_I_IHNPZtjcvpNg--gkKbzfYmle40Mb03kB31IHasWeuv4Z2WkjW1vVm-fqxErNVmYPgGy8DfVFVaAEABLB', //仅为示例，并非真实的接口地址
    //   method: 'POST',
    //   data: {
    //     "path":"page/tools/tools",
    //     "width": 280
    //   },
    //   success (res) {
    //     wx.saveImageToPhotosAlbum({
    //       filePath: res.data,
    //       success(result) {
    //         wx.showToast({
    //           title: '成功'
    //         })
    //       }
    //     })
    //   }
    // })
    // this.CalcBuffTextHeight()
  }
})

