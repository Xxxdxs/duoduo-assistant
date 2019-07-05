function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]]
}

function sleep(ms) {
  return new Promise(reslove => {
    setTimeout(reslove, ms)
  })
}

module.exports = {
  swap: swap,
  sleep: sleep
}