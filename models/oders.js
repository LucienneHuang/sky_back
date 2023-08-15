import { Schema, ObjectId, model } from 'mongoose'
// 結帳的時候把使用者的購物車資料直接貼過來
const orderSchema = Schema({
  prooduct: {
    type: ObjectId,
    ref: 'products',
    required: [true, '缺少商品']
  },
  quantity: {
    type: Number,
    required: [true, '缺少數量']
  }
}, { versionKey: false })

const schema = new Schema({
  // 買家
  user: {
    type: ObjectId,
    ref: 'users',
    required: [true, '缺少使用者']
  },
  // 賣家
  seller: {
    type: ObjectId,
    ref: 'users',
    required: [true, '缺少賣家']
  },
  // 訂單日期
  date: {
    type: Date,
    default: Date.now
  },
  // 購物車
  cart: {
    type: [orderSchema],
    default: [],
    validate: {
      validator (value) {
        // 你結帳不能結空的購物車
        // Array.isArray 檢查東西是不是陣列且長度要大於 0
        return Array.isArray(value) && value.length > 0
      },
      message: '購物車不能為空'
    }
  }
}, { versionKey: false })

export default model('orders', schema)
