import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import mongoSanitize from 'express-mongo-sanitize'
import cors from 'cors'
import usersRoute from './routes/users.js'
import contactUsRoute from './routes/contactUs.js'
import './passport/passport.js'
// passport 還沒寫、狀態碼還沒裝、路由這些還沒寫

const app = express()

app.use(cors({

  // origin 請求來源
  // callback(錯誤, 是否允許請求)
  origin (origin, callback) {
    // undefined 可能來自於 postman
    if (origin === undefined || origin.includes('github') || origin.includes('localhost')) {
      // 允許
      callback(null, true)
    } else {
      // 不允許
      callback(new Error('CORS', false))
    }
  }
}))
app.use((_, req, res, next) => {
  res.status(StatusCodes.FORBIDDEN).json({
    success: false,
    message: '請求被拒'
  })
})

app.use(express.json())
app.use((_, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: '資料格式錯誤'
  })
})

app.use(mongoSanitize())

app.use('/users', usersRoute)
app.use('/contactUs', contactUsRoute)

// all 代表 get, post, patch ...
// * 所有路徑的所有請求
app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: '找不到'
  })
})

app.listen(process.env.PORT || 4000, async () => {
  console.log('伺服器啟動')
  await mongoose.connect(process.env.DB_URL)
  // sanitizeFilter : 防止別人對資料庫進行攻擊
  mongoose.set('sanitizeFilter', true)
  console.log('資料庫連線成功')
})
