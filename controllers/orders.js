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
    const user = await users.findById(req.user._id, 'cart').populate('cart.productCart.product')
    // every 是不是每個都 return true
    // some 是有沒有任何一個東西 return true
    // filter 是 true 的留著，false 踢掉
    // 每一個 cart.product.sell 都是 true，canCheckOut才會是 true
    const canCheckOut = user.cart.every(cart => {
      return cart.productCart.every(item => item.product.sell)
    })
    if (!canCheckOut) {
      throw new Error('SELL')
    }
    // 建立訂單
    for (const miniCart in user.cart) {
      const sum = user.cart[miniCart].productCart.reduce((total, current) => total + (current.quantity * current.product.price), 0)
      await orders.create({
        user: user._id,
        seller: user.cart[miniCart].seller,
        realName: req.body.realName,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        payment: req.body.payment,
        date: req.body.date,
        total: sum,
        cart: user.cart[miniCart].productCart
      })
    }
    // 清空購物車
    req.user.cart = []
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
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
    const result = await orders.find({ user: req.user._id }).populate('cart.product').populate('seller', 'nickname')
    res.status(StatusCodes.OK).json({
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
export const getSell = async (req, res) => {
  try {
    const result = await orders.find({ seller: req.user._id }).populate('cart.product').populate('user', 'nickname')
    res.status(StatusCodes.OK).json({
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
    const result = await orders.find().populate('cart.product').populate('user', 'nickname')
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
export const updateOrder = async (req, res) => {
  try {
    const result = await orders.findByIdAndUpdate(req.params.id, {
      check: req.body.check
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
