// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

const isDev = false
const DEV_BASE_URL = 'http://localhost:3000/client/api'
const PROD_BASE_URL = 'http://xlxlx.xyz:3000/client/api'

const BASE_URL = isDev ? DEV_BASE_URL : PROD_BASE_URL
// cloud-dev-0f318b cloud-prod-yg88k
cloud.init({
  // env: 'cloud-prod-yg88k'
  env: process.env.cloudName
  // env: 'cloud-prod-yg88k'
})

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    if (event.name === 'tools') {
      // 把工具页面函数整合起来， 节约资源
    }

    if (event.name === 'races') {
      const data = await db.collection('races').where({}).get()

      const ret = data.data.map(el => {
        const { name, ethnicPattern, ethnicIcon, skills } = el
        return { name, ethnicPattern, ethnicIcon, skills }
      })
      // 保留errormessage
      return { ...data, data: ret }
    }

    if (event.name === 'heroes') {
      const data = await db.collection('heroes').where({}).get()
      const ret = data.data.map(el => {
        const { name, miniIcon, icon, cardQuality, category, cardType, heroId, _id } = el
        return { name, miniIcon, icon, cardQuality, category, cardType, heroId, _id }
      })
      return { ...data, data: ret }
    }

    if (event.name === 'careers') {
      const data = await db.collection('careers').where({}).get()
      return data
    }

    if (event.name === 'qualities') {
      const data = await db.collection('qualities').where({}).get()
      return data
    }

    if (event.name === 'getHeroById') {
      const data = await db.collection('heroes').doc(event.id).get()
      return data
    }

    // 来源
    if (event.name === 'getSources') {
      const res = await axios.get(BASE_URL + '/source/list')
      return {data: res.data}
    }

    if (event.name === 'strategy') {
      const res = await axios.get(BASE_URL + '/post/list')
      return { data: res.data }
    }
    
    // userId 不是 openid, 需要登录获取
    if (event.name === 'setCollectitonById') {
      const { postId, userId } = event
      const res = await axios.post(BASE_URL + `/collection/${postId}`, {
        userId
      })
      return { data: res.data }
    }

    if (event.name === 'setLikeById') {
      const { postId, userId } = event
      const res = await axios.post(BASE_URL + `/like/${postId}`, {
        userId
      })
      return { data: res.data }
    }

    if (event.name === 'getPostById') {
      const {postId, userId} = event
      const res = await axios.get(BASE_URL + `/post/${postId}`, {
        params: {
          userId
        }
      })
      return {data: res.data}
    }

    if (event.name === 'getCollectionList') {
      const { userId } = event
      const res = await axios.post(BASE_URL + `/collection/list`, {
        userId
      })
      return { data: res.data }
    }

    if (event.name === 'login') {
      const res = await axios.post(BASE_URL + '/login', {
        avatar: event.avatar,
        openId: wxContext.OPENID,
        nickname: event.nickname
      })

      return {
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
        userId: res.data.userId,
        success: res.data.success
      }
    }

    if (event.name === 'teams') {
      const data = await db.collection('teams').where({}).get()
      const teams = data.data
      for(const [index1, value] of teams.entries()) {
        let { teamList } = value
        for (const [index2, team] of teamList.entries()) {
          const idObjList = team.chessList.map(el => ({ _id: el }))
          const res = await db.collection('heroes')
              .where(db.command.or(idObjList))
              .field({
                name: true,
                _id: true,
                miniIcon: true,
                category: true,
                cardType: true,
                heroId: true
              })
              .get()
          teams[index1].teamList[index2].chessList = res.data
        }
      }
      return data
    }

    if (event.name === 'notice') {
      // 顶部通知
      const res = await db.collection('notices').where({}).get()
      const notice = res.data[0]
      return {data: notice}
    }

    if (event.name === 'test') {
      // const res = await db.collection('heroes').get()
      // const heroes = res.data
      // for(let i = 0; i < heroes.length; i++) {
      //   await db.collection('heroes').doc(heroes[i]._id).update({
      //     data: {
      //       heroId: heroes[i].heroId.substring(1)
      //     }
      //   })
      // }
    }

  } catch (e) {
    console.log(e)
  }
}
