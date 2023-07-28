import passport from 'passport'
import passportLocal from 'passport-local'
import passportJWT from 'passport-jwt'
import bcrypt from 'bcrypt'
import users from '../models/users.js'

// 建立一個驗證方式叫做 login，使用 passportLocal 的驗證策略，裡面放驗證策略的設定
passport.use('login', new passportLocal.Strategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // 找到一個 user 的 email 跟傳入的 email 一樣
    const user = await users.findOne({ email })
    // 如果找不到該 user
    if (!user) {
      // 拋出一個 error
      throw new Error('USER NOT FOUND')
    }
    // 如果找到了，則去比較傳入的 password ，跟 user 的 password 是否一樣
    // 如果不一樣
    if (!bcrypt.compareSync(password, user.password)) {
      // 拋出一個 error
      throw new Error('PASSWORD NOT FOUND')
    }
    // 如果上述兩者皆滿足
    return done(null, user)
  } catch (error) {
    if (error.message === 'USER NOT FOUND') {
      // false 是沒有資料傳出去
      return done(null, false, { message: 'Email不存在' })
    } else if (error.message === 'PASSWORD NOT FOUND') {
      return done(null, false, { message: '密碼錯誤' })
    } else {
      return done(error, false, { message: '錯誤' })
    }
  }
}))
// 建立一個驗證方式叫做 jwt，使用 passportJWT 的驗證策略，裡面放驗證策略的設定
passport.use('jwt', new passportJWT.Strategy({
  // 先設定從哪裡拿 jwt
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  // 設定驗證 JWT 的 secret
  secretOrKey: process.env.JWT_SECRET,
  // 讓後面的 function 能使用 req
  // 如果需要在 verify callback 中取得 req
  passReqToCallback: true,
  // 忽略過期檢查，如果沒有家這個，他會進到 middelwares 的錯誤那邊去
  ignoreExpiration: true
}, async (req, payload, done) => {
  try {
    // 檢查過期狀態
    // jwt 解譯出來的東西會放到 payload 裡面，exp 代表過期時間，單位是秒
    // Date.now() 的單位是毫秒，所以要乘以 1000
    // 確認他是否小於現在的時間
    const expired = payload.exp * 1000 < Date.now()
    const url = req.baseUrl + req.path
    // 如果過期，而且我的網址不是舊換新的網址，也不是登出的網址，他就是逾期
    if (expired && url !== '/users/extend' && url !== 'users/logout') {
      throw new Error('EXPIRED')
    }
    const token = req.headers.authorization.split(' ')[1]
    const user = await users.findOne({ _id: payload._id, tokens: token })
    if (!user) {
      throw new Error('NO USER')
    }
    return done(null, { user, token })
  } catch (error) {
    if (error.message === 'EXPIRED') {
      return done(null, false, { message: '登入逾時' })
    } else if (error.message === 'NO USER') {
      return done(null, false, { message: '使用者或 JWT 無效' })
    } else {
      return done(error, false, { message: '錯誤' })
    }
  }
}))
