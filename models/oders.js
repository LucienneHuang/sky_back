import { Schema, ObjectId, model } from 'mongoose'
import validator from 'validator'
// 結帳的時候把使用者的購物車資料直接貼過來
const orderSchema = Schema({
  quantity: {
    type: Number,
    required: [true, '缺少數量']
  },
  product: {
    type: ObjectId,
    ref: 'products',
    required: [true, '缺少商品']
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
  realName: {
    type: String,
    required: [true, '缺少姓名']
  },
  phoneNumber: {
    type: String,
    required: [true, '缺少電話'],
    validate: {
      validator (value) {
        return validator.isMobilePhone(value, 'zh-TW')
      },
      message: '電話格式錯誤'
    }
  },
  address: {
    type: String,
    required: [true, '缺少送貨地址/網址']
  },
  payment: {
    type: String,
    required: [true, '缺少付款方式'],
    enum: {
      values: ['轉帳', 'linepay', '貨到付款'],
      message: '找不到 {VALUE} 分類'
    }
  },
  total: {
    type: Number,
    required: [true, '缺少總金額']
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
  },
  check: {
    type: Boolean,
    default: false
  }
}, { versionKey: false })

export default model('orders', schema)
