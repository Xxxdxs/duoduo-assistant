function defineReactive(data, key, val, fn) {
  const subs = data['$' + key] || []
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get() {
      if (data.$target) {
        subs.push(data.$target)
        data['$' + key] = subs
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      fn && fn(newVal)
      if (subs.length) {
        setTimeout(() => {
          subs.forEach(sub => sub())
        }, 0)
      }
      val = newVal
    }
  })
}

function watch(ctx, obj) {
  Object.keys(obj).forEach(key => {
    defineReactive(ctx.data, key, ctx.data[key], function(val) {
      obj[key].call(ctx, val)
    })
  })
}

function computed(ctx, obj) {
  const keys = Object.keys(obj)
  const dataKeys = Object.keys(ctx.data)
  // data中每一个属性执行defineReactive()
  dataKeys.forEach(key => {
    defineReactive(ctx.data, key, ctx.data[key])
  })
  // initComputedObj = {test1: fn1(), test2: fn2()}
  const initComputedObj = keys.reduce((acc, cur) => {
    // 意义不明
    ctx.data.$target = function() {
      // ctx.setData({test1: fn1()})
      // fn1()中引用了data.test()属性
      // test属性进行get操作
      // get操作发现data.$target存在把它加到subs
      // 然后再在set后一次执行subs中的方法
      ctx.setData({[cur]: obj[cur].call(ctx)})
    }
    // 初始计算每一个计算属性的值
    acc[cur] = obj[cur].call(ctx)
    ctx.data.$target = null
    return acc
  }, {})

  ctx.setData(initComputedObj)
}

module.exports = {computed, watch}