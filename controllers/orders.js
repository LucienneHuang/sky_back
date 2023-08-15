import { StatusCodes } from 'http-status-codes'
import { getMessageFromValidationError } from '../utils/error.js'
import orders from '../models/oders.js'
import users from '../models/users.js'

export const create = async (req, res) => {
  try {
    // 檢查購物車是不是空的
    if (req.user.cart.length === 0) {
      throw new Error('EMPTY')
    }
    const user = users.findById(req.user._id, 'cart').populate('cart.product')
    // every 是不是每個都 return true
    // some 是有沒有任何一個東西 return true
    // filter 是 true 的留著，false 踢掉

    // 每一個 cart.product.sell 都是 true，canCheckOut才會是 true
    const canCheckOut = user.cart.every(cart => cart.product.sell)
    if (canCheckOut) {
      throw new Error('SELL')
    }
    // 建立訂單
    const result = await orders.create({
      user: req.user._id,
      cart: req.user.cart
    })
    // 清空購物車
    req.user.cart = []
    await req.user.save()
    req.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.message === 'EMPTY') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '購物車為空'
      })
    } else if (error.message === 'SELL') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '包含下架商品'
      })
    } else if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}
export const get = async (req, res) => {
  try {
    const result = await orders.find({ user: req.user._id }).populate('cart.product')
    req.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}
export const getAll = async (req, res) => {
  try {
    // 後面那個是代入 user 的資料 但是只取 email 欄位
    const result = await orders.find().populate('cart.product').populate('user', 'email')
    req.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}
