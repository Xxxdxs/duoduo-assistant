# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## 坑
1. 云开发数据库不好操作
2. 云开发数据库指定_id字段导出 在csv和json中表现不同 有的为$oid有的为ObjectId
3. utf-8的csv, excel选择utf-8编码后打开还是乱码, 前面还没问题...



  "tabBar": {
    "color": "#5797D5",
    "selectedColor": "#fff",
    "backgroundColor": "#1C2A39",
    "list": [
      {
        "pagePath": "pages/tools/tools",
        "text": "工具"
      },
      {
        "pagePath": "pages/strategy/strategy",
        "text": "攻略"
      },
      {
        "pagePath": "pages/strategy/strategy",
        "text": "资料库"
      },
      {
        "pagePath": "pages/user/user",
        "text": "我的"
      }
    ]
  }