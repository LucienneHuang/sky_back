import { StatusCodes } from 'http-status-codes'
import products from '../models/products.js'
import { getMessageFromValidationError } from '../utils/error.js'

export const create = async (req, res) => {
  try {
    const result = await products.create({
      user: req.body.user,
      name: req.body.name,
      price: req.body.price,
      currency: req.body.currency,
      MaxNumber: req.body.MaxNumber,
      image: req.files.image[0].path,
      images: req.files.path,
      description: req.body.description,
      category: req.body.category,
      sell: req.body.sell
    })
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
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

// 取所有商品，給管理員看的
export const getAll = async (req, res) => {
  try {
    const result = await products.find()
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
// 取所有自己的商品
export const getOwn = async (req, res) => {
  try {
    const result = await products.find({ user: req.user._id })
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

// 給前端看的，get 只找有上架的東西
export const get = async (req, res) => {
  try {
    // sell: true 設定只有在架上的東西
    const result = await products.find({ sell: true })
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

export const getId = async (req, res) => {
  try {
    // req.params.id => 為路由的參數的 id
    const result = await products.findById(req.params.id)
    if (!result) {
      throw new Error('NOT FOUND')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'CastError') {
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

export const editOwnProduct = async (req, res) => {
  try {
    const result = await products.findByIdAndUpdate(req.params.id, {
      user: req.body.user,
      name: req.body.name,
      price: req.body.price,
      currency: req.body.currency,
      image: req.file?.path,
      images: req.file?.path,
      description: req.body.description,
      category: req.body.category,
      sell: req.body.sell
    }, { new: true, runValidators: true })
    if (!result) {
      throw new Error('NOT FOUND')
    }
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
