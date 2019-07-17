// miniprogram/pages/tools/tools.js
const Wxml2Canvas = require('../../wxml2canvas/index.js')
const {watch, computed} = require('../../utils/vuify')
const {sleep} = require('../../utils/tools')
const {chessBoardCanvasList, createChessBoard} = require('../../common/canvas/chessboard')
const zoom = wx.getSystemInfoSync().windowWidth / 375
// TODO
// 1. 棋子 神族, 恶魔, 猎魔人三种种族时 BUFF要特殊处理, 以后还会有巫师职业, 所以这一块要抽出来

Page({

  /**
   * 
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
    jibanRichTextList: [], // 或许用富文本表现更好, 省的多加个属性控制样式, 还要每个羁绊分一个text
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
        // 新增棋子 奇异蛋 卧槽, 没有职业类别 并且是个字符串
          const raceCondition = !filterRace || Boolean(el.cardType && ~el.category.findIndex(el => el === filterRace))
          const careerCondition = !filterCareer || Boolean(el.cardType && ~el.cardType.findIndex(el => el === filterCareer))
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
    const RACE_LIST_ECP_GOD = ['人族', '光羽族', '恶魔', '哥布林', '野兽', '洞洞族', '海族', '不眠', '冰川族', '龙族', '基拉', '灵族', '矮人族']
    let jibanText = ''
    let jibanList = []
    let jibanRichTextList = []
    let dhCount = 0 // 恶魔猎手数量
    let demoCount = 0 // 恶魔数量
    let godCount = 0
    let godBuffLocked = false
    // 猎魔人, 恶魔, 神族 三个种族需要特殊处理

    function createBuffTextNode(content, __type, isLocked = false) {
      const buffTextNode = {name: 'span', attrs: {style: `${isLocked ? 'color: #ff0000;text-decoration: line-through;': 'color: #5896d5;'}`, class: 'fs-sm'}, __type, children: [{type: 'text', text: `${content}`}]}
      return buffTextNode
    }

    raceList.forEach(race => {
      const sameRaceChess = chessGroup.filter(el => el.category.includes(race.name))
      const sameRaceCount = sameRaceChess.length
      raceJibanObj[race.name] = {sameRaceCount, heroList: sameRaceChess, isLocked: false}
    })

    demoCount = raceJibanObj['恶魔'].sameRaceCount
    godCount = raceJibanObj['神族'].sameRaceCount

    careerList.forEach(career => {
      const sameCareerChess = chessGroup.filter(el => el.cardType.includes(career.name))
      const sameCareerCount = sameCareerChess.length
      careerJibanObj[career.name] = {sameCareerCount, heroList: sameCareerChess}
    })

    dhCount = careerJibanObj['恶魔猎手'].sameCareerCount

    for(const k in raceJibanObj) {
      const raceSkills = raceList.find(el => el.name === k).skills
      if (raceJibanObj[k].sameRaceCount > 0) {
        const _raceSkills = raceSkills.filter((el, i) => el[0] <= raceJibanObj[k].sameRaceCount)
        if (_raceSkills.length) {
          // 恶魔文本要特别处理
          if (k === '恶魔') {
            jibanList.push({name: k, list: _raceSkills, heroList: raceJibanObj[k].heroList})
            const raceJibanText = demoCount + k
            jibanText += raceJibanText + ' '
            jibanRichTextList.push(createBuffTextNode(raceJibanText + ' ', k))
          } else {
            jibanList.push({name: k, list: _raceSkills, heroList: raceJibanObj[k].heroList})
            const raceJibanText = _raceSkills[_raceSkills.length - 1][0] + k
            jibanText += raceJibanText + ' '
            jibanRichTextList.push(createBuffTextNode(raceJibanText + ' ', k))
          }
        }
      }
    }
    // 种族羁绊中存在任何其他种族羁绊 神族失效
    if (jibanList.some(item => RACE_LIST_ECP_GOD.includes(item.name))) {
      godBuffLocked = true
    }
    
    if (godBuffLocked && godCount) {
      const index = jibanRichTextList.findIndex(item => item.__type === '神族')
      
      jibanRichTextList.splice(index, 1, createBuffTextNode(jibanRichTextList[index].children[0].text, '神族', godBuffLocked))
      jibanList.find(item => item.name === '神族').buffLocked = true
    }
    

    for(const k in careerJibanObj) {
      const careerSkills = careerList.find(el => el.name === k).skills
      if (careerJibanObj[k].sameCareerCount) {
        const _careerSkills = careerSkills.filter((el, i) => el[0] <= careerJibanObj[k].sameCareerCount)
        if (_careerSkills.length) {
          jibanList.push({name: k, list: _careerSkills, heroList: careerJibanObj[k].heroList})
          const careerJibanText = _careerSkills[_careerSkills.length - 1][0] + k
          jibanText += careerJibanText + ' '
          jibanRichTextList.push(createBuffTextNode(careerJibanText + ' ', k))
        }
      }
    }

    if (demoCount > 1 && dhCount < 2) {
      // 如果恶魔存在且恶魔猎手数量小于2 则恶魔buff失效
      const index = jibanRichTextList.findIndex(item => item.__type === '恶魔')
      jibanRichTextList.splice(index, 1, createBuffTextNode(jibanRichTextList[index].children[0].text, '恶魔', true))
      jibanList.find(item => item.name = '恶魔').buffLocked = true
    }

    // 只能最后处理, 因为DH是职业 jibanRichTextListtime
    this.setData({
      jibanText,
      jibanList,
      jibanRichTextList
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
        height: (80 + this.data.buffTextHeight + 10 + 19) , // 图片的高 为各部分计算而来(插件BUG, 手动*zoom)
        element: 'canvas1', 
        background: '#161f2b',
        progress (percent) {
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

        },
        error (res) {
          console.log(res)
        }
    })
    // 绘图存在很多BUG
    // 待解决 重复图片第二次不绘制
    // 只能讲要画图的部分合并到一个wxml中
    // , {
    //   // 棋盘棋子
    //   type: 'wxml',
    //   class: '.panel .draw_canvas',
    //   limit: '.panel',
    //   x: 27.5,
    //   y: 25
    // }
    let data = {
        list: [
          ...createChessBoard(), {
            // buff效果and棋子
            type: 'wxml',
            class: '.draw-canvas-wrapper .draw_canvas',
            limit: '.draw-canvas-wrapper',
            x: 0,
            y: 19
          }, {
            // 二维码
          type: 'image',
            url: '/common/qrcode/qrcode.jpeg',
            // delay: true,
            x: 27.5,
            // 要动态计算的...
            y: (this.data.buffTextHeight + 19),
            style: {
              width: 80,
              height: 80
          }
        }, {
          // 介绍文本
          type: 'text',
          text: '一直下棋, 一直爽! by多多岛小助手',
          x: 125,
          y: (this.data.buffTextHeight + 20 + 19),
          style: {
            fontSize: 10,
              lineHeight: 20,
              color: '#5896d5',
              width: 220
          }
        }, {
          // 介绍文本
          type: 'text',
          text: '长按识别二维码进入微信小程序',
          x: 125,
          y: (this.data.buffTextHeight + 40 + 19),
          style: {
            fontSize: 10,
              lineHeight: 20,
              color: '#5896d5',
              width: 220
          }
        }
      ]
    }

    drawImage.draw(data);
    wx.showLoading({
      title: '正在生成图片',
    })
  },

  CalcBuffTextHeight() {                                                                                    
    const self = this
    wx.createSelectorQuery().select('.draw-canvas-wrapper').fields({
      size: true
    }, function(res) {
      self.setData({
        buffTextHeight: res.height / zoom
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
      //   url: 'https://api.weixin.qq.com/cgi-bin/token',
      //   method: 'GET',
      //   data: {
      //     grant_type: 'client_credential',
      //     appid: 'wxd9050e85b9c776ca',
      //     secret: ''
      //   },
      //   success(res1) {
      //     console.log(res1)
      //     wx.request({
      //       url: `https://api.weixin.qq.com/wxa/getwxacode?access_token=${res1.data.access_token}`, //仅为示例，并非真实的接口地址
      //       method: 'POST',
      //       data: {
      //         "path": "pages/tools/tools",
      //         "width": 280
      //       },
      //       success(res2) {
      //         console.log(res2)
      //       }
      //     })
      //   }
      // })

    // this.CalcBuffTextHeight()
  }
})

