import passport from 'passport'
import jsonwebtoken from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
// 三個參數 middleware
// 兩個參數 controller
// 四個參數 middleware 的錯誤處理
export const login = (req, res, next) => {
  // 使用 login 的驗證方式
  passport.authenticate('login', { session: false }, (error, user, info) => {
    // 如果有錯誤或沒有 user
    if (error || !user) {
      if (info.message === 'Missing credentials') {
        info.message = '欄位錯誤'
      }
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: info.message
      })
    }
    req.user = user
    next()
  })(req, res, next)
}

export const jwt = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, data, info) => {
    if (error || !data) {
      if (info instanceof jsonwebtoken.JsonWebTokenError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'JWT 錯誤'
        })
      }
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: info.message || '錯誤'
      })
    }
    req.user = data.user
    req.token = data.token
    next()
  })(req, res, next)
}
