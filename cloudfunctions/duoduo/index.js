// 云函数入口文件
const cloud = require('wx-server-sdk')
const heromap = require('./heromap.json')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    if (event.name === 'races') {
      const data = await db.collection('races').where({}).get()
      console.log(data)
      const ret = data.data.map(el => {
        const { name, ethnicPattern, ethnicIcon, skills } = el
        return { name, ethnicPattern, ethnicIcon, skills}
      })
      return {...data, data: ret}
    }

    if (event.name === 'heroes') {
      const data = await db.collection('heroes').where({}).get()
      const ret = data.data.map(el => {
        const { name, miniIcon, icon, cardQuality, category, cardType } = el
        return { name, miniIcon, icon, cardQuality, category, cardType }
      })
      
      return {...data, data: ret }
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
      const data = await db.collection('heroes').doc(event._id).get()
      return data
    }
  } catch(e) {
    console.log(e)
  }
}

// if (event.name === 'alterDB') {
//   console.log(heromap)
//   for (let item of heromap) {
//     await db.collection('heroes').doc(item._id).update({
//       data: {
//         miniIcon: item.miniIcon
//       }
//     })
//   }
//   const data = await db.collection('heroes').where({}).get()
//   return data
// }