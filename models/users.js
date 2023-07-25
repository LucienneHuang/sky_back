import { Schema, ObjectId, Error, model } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole'

const cartSchema = Schema({
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
  // 信箱
  email: {
    type: String,
    required: [true, '缺少信箱'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '信箱格式錯誤'
    }

  },
  // 密碼
  password: {
    type: String,
    required: [true, '缺少密碼']
  },
  // 暱稱
  nickname: {
    type: String,
    default: `${this.email.split('@')[0]}`
  },
  // 頭貼
  avatar: {
    type: String,
    default () {
      return `https://source.boringavatars.com/beam/250/${this.email.split('@')[0]}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`
    }
  },
  tokens: {
    type: [String], // 文字的陣列
    default: [] // 預設值是空的陣列
  },
  // 購物車
  cart: {
    type: [cartSchema],
    default: []
  },
  // 權限
  role: {
    type: Number,
    default: UserRole.USER
  }
}, { versionKey: false })

schema.pre('save', function (next) {
  // this 指到我們要保存的那個資料
  const user = this
  if (user.isModified('password')) {
    if (user.password.length < 4) {
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼太短' }))
      next(error)
      return
    } else if (user.password.length > 20) {
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼太長' }))
      next(error)
      return
    } else {
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

schema.pre('findOneAndUpdate', function (next) {
  const user = this._update
  if (user.password) {
    if (user.password.length < 4) {
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼太短' }))
      next(error)
      return
    } else if (user.password.length > 20) {
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼太長' }))
      next(error)
      return
    } else {
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

export default model('users', schema)
