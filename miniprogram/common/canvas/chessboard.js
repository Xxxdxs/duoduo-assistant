// 应为wxml2canvas这个库的_drawRect会直接修改这个list, 
// 所以改成函数形式
// 简单一下, 反正肯定都是plain obj
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

const zoom = wx.getSystemInfoSync().windowWidth / 375
const cellWidth = 40
const cellHeight = 40
const initPaddingX = 27.5
const initPaddingY = 25
const cellColor1 = '#f7f8f9'
const cellColor2 = '#e9ebed'

// const cellColor1 = '#3B5375'
// const cellColor2 = '#223144'
let chessBoardCanvasList = []

// 棋盘单元格有两种, 每行的顺序不一样
const chessBoardCanvasCell1 = {
  type: 'rect',
  x: initPaddingX,
  y: initPaddingY,
  style: {
    width: cellWidth,
    height: cellHeight,
    fill: cellColor1,
  }
}
const chessBoardCanvasCell2 = {
  type: 'rect',
  x: initPaddingX,
  y: initPaddingY,
  style: {
    width: cellWidth,
    height: cellHeight,
    fill: cellColor2,
  }
}

const chessBoardCanvasLine1 = Array.from({length: 8}).map((el, i) => {
  let cell = i % 2 ? deepClone(chessBoardCanvasCell2) : deepClone(chessBoardCanvasCell1)
  cell.x += cellWidth * i
  return cell
})

const chessBoardCanvasLine2 = Array.from({length: 8}).map((el, i) => {
  let cell = i % 2 ? deepClone(chessBoardCanvasCell1) : deepClone(chessBoardCanvasCell2)
  cell.x += cellWidth * i
  cell.y += cellHeight
  return cell
})

const chessBoardCanvasLine3 = Array.from({length: 8}).map((el, i) => {
  let cell = i % 2 ? deepClone(chessBoardCanvasCell2) : deepClone(chessBoardCanvasCell1)
  cell.x += cellWidth * i
  cell.y += cellHeight * 2
  return cell
})

const chessBoardCanvasLine4 = Array.from({length: 8}).map((el, i) => {
  let cell = i % 2 ? deepClone(chessBoardCanvasCell1) : deepClone(chessBoardCanvasCell2)
  cell.x += cellWidth * i
  cell.y += cellHeight * 3
  return cell
})

chessBoardCanvasList = [...chessBoardCanvasLine1, ...chessBoardCanvasLine2, ...chessBoardCanvasLine3, ...chessBoardCanvasLine4]

function createChessBoard() {
  return chessBoardCanvasList.map(item => deepClone(item))
}

module.exports = {
  chessBoardCanvasList: chessBoardCanvasList,
  createChessBoard: createChessBoard
}