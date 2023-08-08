import { StatusCodes } from 'http-status-codes'
import articles from '../models/articles.js'
import { getMessageFromValidationError } from '../utils/error.js'

export const create = async (req, res) => {
  try {
    const result = await articles.create({
      title: req.body.title,
      original: req.body.original,
      translation: req.body.translation,
      date: req.body.date,
      image: req.files.image[0].path,
      description: req.body.description,
      category: req.body.category,
      realms: req.body.realms,
      display: req.body.display
    })
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
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

// 取得所有文章
export const getAll = async (req, res) => {
  try {
    const result = await articles.find().sort({ date: -1 })
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
// 取得區域文章
// 還沒寫完
export const getRealms = async (req, res) => {
  try {
    const result = await articles.find({ category: '區域介紹', display: true }).sort({ date: 1 })
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
// 取得最新消息文章
// 還沒寫完
export const getNews = async (req, res) => {
  try {
    const result = await articles.find({ category: '區域介紹', display: true }).sort({ date: 1 })
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
// 更新文章
export const editArticle = async (req, res) => {
  try {
    const mainImg = req.files.image ? req.files.image[0].path : req.body.image
    const result = await articles.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      original: req.body.original,
      translation: req.body.translation,
      date: req.body.date,
      image: mainImg,
      description: req.body.description,
      category: req.body.category,
      realms: req.body.realms,
      display: req.body.display
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

export const deleteArticle = async (req, res) => {
  try {
    await articles.deleteOne({ _id: req.params.id })
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '錯誤'
    })
  }
}