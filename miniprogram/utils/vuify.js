function defineReactive(data, key, val, fn) {
  // 每次调用的时候应该不存在$开头变量啊。。
  // 在computed中将data所有属性都相应化了...
  const subs = data["$" + key] || [];
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get() {
      if (data.$target) {
        subs.push(data.$target);
        data["$" + key] = subs;
      }
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        fn && fn(newVal);
        if (subs.length) {
          // 执行依赖
          setTimeout(() => {
            subs.forEach(sub => sub());
          }, 0);
        }
        val = newVal;
      }
    }
  });
}

/**
 * watch比较简单， 当属性变化时， 执行回调即可。
 * @param {*} ctx
 * @param {*} obj
 */

function watch(ctx, obj) {
  Object.keys(obj).forEach(key => {
    defineReactive(ctx.data, key, ctx.data[key], function(val) {
      obj[key].call(ctx, val);
    });
  });
}

/**
 *
 * @param {*} ctx
 * @param {*} obj
 */

function computed(ctx, obj) {
  const keys = Object.keys(obj);
  const dataKeys = Object.keys(ctx.data);
  // data中每一个属性执行defineReactive()
  // 此处要优化， 没有依赖到的不需要响应式
  // (感觉没必要， 小程序只有setData才会触发视图更新， 不像Vue修改data视图更新)
  dataKeys.forEach(key => {
    defineReactive(ctx.data, key, ctx.data[key]);
  });
  // initComputedObj = {test1: fn1(), test2: fn2()}
  const initComputedObj = keys.reduce((acc, cur) => {
    // 意义不明 Vue中的Dep对象中有将watcher实例挂载为dep的静态属性target
    // 不管怎样$target不能重复
    ctx.data.$target = function() {
      // ctx.setData({test1: fn1()})
      // fn1()中引用了data.test()属性
      // test属性进行get操作
      // get操作发现data.$target存在把它加到subs
      // 然后再在set后一次执行subs中的方法
      ctx.setData({ [cur]: obj[cur].call(ctx) });
    };
    // 初始计算每一个计算属性的值
    // 此处会对data上的属性进行get操作， 操作完重置target
    // 计算完后， 下面会统一进行setData
    // $target不为null， 触发getter的data属性值会添加$前缀。
    acc[cur] = obj[cur].call(ctx);
    // 将$target重置
    ctx.data.$target = null;
    return acc;
  }, {});
  //
  ctx.setData(initComputedObj);
}

module.exports = { computed, watch };
