import users from '../models/users.js'
import { StatusCodes } from 'http-status-codes'
import { getMessageFromValidationError } from '../utils/error.js'
import jwt from 'jsonwebtoken'

// 註冊
export const register = async (req, res) => {
  try {
    const result = await users.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號已註冊'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

// 登入
export const login = async (req, res) => {
  try {
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        token,
        email: req.user.email,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        // total 目前加到多少
        // current 目前的東西
        cart: req.user.cart.reduce((total, current) => total + current.quantity, 0),
        role: req.user.role,
        user: req.user._id
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

// 登出
export const logout = async (req, res) => {
  try {
    // 用 filter 把一樣的 token 拿掉
    // 也可以用 findIndex 再 splice，能拿掉就好了
    req.user.tokens = req.user.tokens.filter(token => token !== req.token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

// 舊換新
export const extend = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex(token => token === req.token)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens[idx] = token
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: token
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

// 取得使用者資料
// 會在有登入狀態 + 進網頁時會用到
// 不需要 async，因為使用者資料已經在 req.user 裡面了
// 在這裡取得 email、role、nickname、avatar、cart 資料
export const getProfile = (req, res) => {
  try {
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        cart: req.user.cart.reduce((total, current) => total + current.quantity, 0)
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

export const editProfile = async (req, res) => {
  try {
    const avatarImg = req.files.avatar ? req.files.avatar[0].path : req.body.avatar
    const result = await users.findByIdAndUpdate(req.params.id, {
      email: req.body.email,
      nickname: req.body.nickname,
      avatar: avatarImg
    }, { new: true, runValidators: true })
    if (!result) {
      throw new Error('NOT FOUND')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}
// 取得所有使用者
export const getAll = async (req, res) => {
  try {
    const result = await users.find().sort({ role: -1 })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}
