import { Schema, model, ObjectId } from 'mongoose'

const schema = new Schema({
  // 賣家
  user: {
    type: ObjectId,
    ref: 'users',
    required: [true, '缺少賣家']
  },
  // 商品名稱
  name: {
    type: String,
    required: [true, '缺少商品名稱']
  },
  // 商品價格
  price: {
    type: Number,
    required: [true, '缺少商品價格'],
    min: [0, '價格太低']
  },
  // 商品價格單位
  currency: {
    type: String,
    required: [true, '缺少商品幣值單位'],
    enum: {
      values: ['台幣'],
      message: '找不到 {VALUE} 單位'
    }
  },
  MaxNumber: {
    type: Number,
    required: [true, '缺少商品數量'],
    min: [0, '數量太少']
  },
  // 商品圖片
  image: {
    type: String,
    required: [true, '缺少商品圖片']
  },
  // 商品圖片(選填)
  images: {
    type: [String],
    default: []
  },
  // 商品說明
  description: {
    type: String,
    required: [true, '缺少商品說明']
  },
  // 商品分類
  category: {
    type: String,
    required: [true, '缺少商品分類'],
    enum: {
      values: ['季票', '禮包', '周邊', '其他'],
      message: '找不到 {VALUE} 分類'
    }
  },
  // 是否上架
  sell: {
    type: Boolean,
    required: [true, '缺少商品上架狀態']
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false })

export default model('products', schema)
