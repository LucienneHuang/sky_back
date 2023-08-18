import { Schema, model } from 'mongoose'
import validator from 'validator'

const schema = new Schema({
  name: {
    type: String,
    required: [true, '缺少稱呼']
  },
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
  message: {
    type: String,
    required: [true, '缺少內容']
  },
  done: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false })
export default model('contactUs', schema)
