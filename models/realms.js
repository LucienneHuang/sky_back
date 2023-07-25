import { Schema, model } from 'mongoose'

const schema = new Schema({
  // 文章標題
  title: {
    type: String,
    required: [true, '缺少標題']
  },
  // 原文網址
  original: {
    type: String,
    default: ''
  },
  // 翻譯來源
  translation: {
    type: String,
    default: ''
  },
  // 文章發布日期
  date: {
    type: Date,
    required: [true, '缺少日期']
  },
  // 圖片
  image: {
    type: String,
    required: [true, '缺少圖片']
  },
  // 圖片(選填)
  images: {
    type: [String],
    default: []
  },
  // 完整文章
  description: {
    type: String,
    required: [true, '缺少內文']
  }
}, { versionKey: false })

export default model('realms', schema)
