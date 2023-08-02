import contactUs from '../models/contactUs.js'
import { StatusCodes } from 'http-status-codes'

export const sendMessage = async (req, res) => {
  try {
    const result = await contactUs.create(req.body)
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
export const getMessage = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        name: req.contactUs.name,
        email: req.contactUs.email,
        message: req.contactUs.message
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
