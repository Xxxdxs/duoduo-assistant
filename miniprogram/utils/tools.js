function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]]
}

function sleep(ms) {
  return new Promise(reslove => {
    setTimeout(reslove, ms)
  })
}

// 传入一些默认参数
async function requestCloud(funcName, data, app, needLogin) {
  let userId = ''
  if (app) {
    userId = await app.getUserId()

    if (!userId && needLogin) {
      wx.showToast({
        title: '没有登录',
        icon: 'none'
      })
      return
    }
  }

  return wx.cloud.callFunction({
    name: 'duoduo',
    data: {
      name: funcName,
      ...data,
      userId
    }
  })
}

module.exports = {
  swap: swap,
  sleep: sleep,
  requestCloud: requestCloud
}