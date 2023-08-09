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
  // 原文發布日期
  date: {
    type: String,
    required: [true, '缺少日期']
  },
  // 圖片
  image: {
    type: String,
    required: [true, '缺少圖片']
  },
  // 完整文章
  description: {
    type: String,
    required: [true, '缺少內文']
  },
  category: {
    type: String,
    required: [true, '缺少文章分類'],
    enum: {
      values: ['最新消息', '區域介紹'],
      message: '找不到 {VALUE} 分類'
    }
  },
  realms: {
    type: String,
    required: [true, '缺少區域分類'],
    enum: {
      values: ['無', '晨島', '雲野', '雨林', '霞谷', '暮土', '禁閣'],
      message: '找不到 {VALUE} 分類'
    }
  },
  display: {
    type: Boolean,
    required: [true, '缺少是否顯示']
  }
}, { versionKey: false })

export default model('articles', schema)
