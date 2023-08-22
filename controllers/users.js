import users from '../models/users.js'
import products from '../models/products.js'
import { StatusCodes } from 'http-status-codes'
import { getMessageFromValidationError } from '../utils/error.js'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

// 註冊
export const register = async (req, res) => {
  try {
    const result = await users.create(req.body)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: `${process.env.EMAIL_ACCOUNT}`,
        pass: `${process.env.EMAIL_PASSWORD}`
      }
    })
    await transporter.sendMail({
      from: `${process.env.EMAIL_ACCOUNT}`,
      to: `${req.body.email}`,
      subject: 'Sky Club | 註冊確認信',
      html: `<div>
      <div style="font-size: 2rem;">Sky Club 註冊通知信</div>
      <hr>
      <div style="font-size: 1.1rem;font-weight: 600;">尊敬的用戶您好，歡迎您註冊 <a
          href="https://luciennehuang.github.io/SkyClub/#/">Sky Club</a>。</div><br>
      <div style="font-size: 1rem;font-weight: 600;">您的會員帳戶已建立，即日起您可以透過 Email 登入，並且能使用交易功能。<br>如果有任何疑問，歡迎<a
          href="https://luciennehuang.github.io/SkyClub/#/contact">聯絡我們</a>。<br>Sky Club 祝您有美好的一天。</div>
    </div>`
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
        user: req.user._id,
        block: req.user.block
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
        block: req.user.block,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        cart: req.user.cart.reduce((total, current) => total + current.quantity, 0)
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}
// 編輯個人檔案
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}
// 取得所有被 block 的使用者
export const getBlock = async (req, res) => {
  try {
    const result = await users.find({ block: 1 }, { _id: 1 })
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

export const userManage = async (req, res) => {
  try {
    const avatarImg = req.files.avatar ? req.files.avatar[0].path : req.body.avatar
    const result = await users.findByIdAndUpdate(req.params.id, {
      email: req.body.email,
      nickname: req.body.nickname,
      avatar: avatarImg,
      block: req.body.block
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

export const getCart = async (req, res) => {
  try {
    const result = await users.findById(req.user._id, 'cart').populate('cart.productCart.product').populate('cart.seller', 'nickname')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: result.cart
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

export const editCart = async (req, res) => {
  try {
    console.log(req.body)
    // 尋找購物車有沒有存在該新增商品的賣家
    const idxSeller = req.user.cart.findIndex(cart => cart.seller.toString() === req.body.seller)
    // 如果有賣家
    if (idxSeller > -1) {
      // 檢查是否購物車已經有該商品
      const idx = req.user.cart[idxSeller].productCart.findIndex(productCart => productCart.product.toString() === req.body.product)
      // 如果有該商品
      if (idx > -1) {
        // 先檢查修改後的數量
        const quantity = req.user.cart[idxSeller].productCart[idx].quantity + parseInt(req.body.quantity)
        const productNumber = await products.findById(req.body.product)
        console.log(productNumber.MaxNumber)
        if (quantity <= 0) {
          // 小於 0 ，移除
          req.user.cart[idxSeller].productCart.splice(idx, 1)
          // 再檢查 seller 裡面是否還有商品
          if (req.user.cart[idxSeller].productCart.length <= 0) {
            req.user.cart.splice(idxSeller, 1)
          }
        } else if (quantity > productNumber.MaxNumber) {
          console.log('jere')
          throw new Error('NOT ENOUGH')
        } else {
          req.user.cart[idxSeller].productCart[idx].quantity = quantity
        }
      } else {
        // 如果有賣家但是沒有該商品
        // 檢查商品 id 是否存在
        const product = await products.findById(req.body.product)
        // 如果沒有或沒上架
        if (!product || !product.sell) {
          // 錯誤
          throw new Error('NOT FOUND')
        } else {
          // 有，放入購物車
          req.user.cart[idxSeller].productCart.push({
            product: product._id,
            quantity: req.body.quantity
          })
        }
      }
    } else {
      // 如果購物車沒存那位賣家沒有該賣家
      // 檢查該賣家是否存在
      const seller = await users.findById(req.body.seller)
      // 如果賣家不存在，錯誤
      if (!seller || seller.block) {
        throw new Error('NO USER')
      } else {
        // 如果賣家存在
        // 再檢查是否有該項商品
        const product = await products.findById(req.body.product)
        // 如果沒有那個商品或是他沒有上架，錯誤
        if (!product || !product.sell) {
          throw new Error('NOT FOUND')
        } else {
          // 如果購物車沒存那位賣家，且賣家存在，且該商品存在
          await req.user.cart.push({
            seller: seller._id
          })
          await req.user.cart[req.user.cart.length - 1].productCart.push({
            product: product._id,
            quantity: req.body.quantity
          })
        }
      }
    }
    // 保存
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: req.user.cart.reduce((total, current) => total + current.quantity, 0)

    })
  } catch (error) {
    if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到商品'
      })
    } else if (error.message === 'NO USER') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到賣家'
      })
    } else if (error.message === 'NOT ENOUGH') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '新增數量大於商品剩餘數量'
      })
    } else if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else {
      console.log(error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}
