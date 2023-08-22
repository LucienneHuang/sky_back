import { StatusCodes } from 'http-status-codes'
import nodemailer from 'nodemailer'
import { getMessageFromValidationError } from '../utils/error.js'
import orders from '../models/oders.js'
import users from '../models/users.js'

export const create = async (req, res) => {
  try {
    // 檢查購物車是不是空的
    if (req.user.cart.length === 0) {
      throw new Error('EMPTY')
    }
    const user = await users.findById(req.user._id, 'cart block').populate('cart.productCart.product').populate('cart.seller', 'nickname email')
    // 如果沒有被停權
    if (user.block === 1) {
      throw new Error('BLOCKED')
    } else {
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
        const result = await orders.create({
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
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          auth: {
            user: `${process.env.EMAIL_ACCOUNT}`,
            pass: `${process.env.EMAIL_PASSWORD}`
          }
        })
        let message = ''
        for (const item of user.cart[miniCart].productCart) {
          message += `<tr id="title">
          <td>${item.product.name}</td>
          <td>${item.quantity}</td>
          <td>${item.product.price}</td>
        </tr>`
        }
        transporter.sendMail({
          from: `${process.env.EMAIL_ACCOUNT}`,
          to: `${user.cart[miniCart].seller.email}`,
          subject: 'Sky Club | 售出通知',
          html: `
          <div>
            <div style="font-size: 2rem;">Sky Club 商品售出通知</div>
            <hr>
            <div style="font-size: 1.1rem;font-weight: 600;">尊敬的用戶您好，您的訂單 ${result._id} 已建立，請您確認訂單後可以開始安排出貨，並寄出商品。 </div><br>
            <div style="font-size: 1rem;font-weight: 600;">
              <table border="1">
                <tr>
                  <td>商品名稱</td>
                  <td>商品數量</td>
                  <td>商品單價</td>
                </tr>` +
            `${message}` +
            `<tr>
                  <td colspan="3">總金額：${sum}</td>
                </tr>
              </table>
            </div>
            <div><a
            href="https://luciennehuang.github.io/SkyClub/#/member/sales" style="font-size: 2rem;">&gt;&gt;點此查詢訂單詳情</a>
            </div>
            <div style="font-size: 1rem;font-weight: 600;">如果有任何疑問，歡迎<a
            href="https://luciennehuang.github.io/SkyClub/#/contact">聯絡我們</a>。<br>Sky Club 祝您有美好的一天。</div>
          </div>
          `
        }).then(info => {
          console.log({ info })
        }).catch(console.error)
      }
      // 清空購物車
      req.user.cart = []
      await req.user.save()

      res.status(StatusCodes.OK).json({
        success: true,
        message: ''
      })
    }
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
    } else if (error.message === 'BLOCKED') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '帳號停權中'
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
    const result = await orders.find().populate('cart.product').populate('user', 'nickname').populate('seller', 'nickname')
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
    const order = await orders.findById(req.params.id).populate('user', 'email').populate('cart.product').populate('seller', 'nickname')

    if (req.body.check === true) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: `${process.env.EMAIL_ACCOUNT}`,
          pass: `${process.env.EMAIL_PASSWORD}`
        }
      })
      let message = ''
      for (const item of order.cart) {
        message += `<tr id="title">
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>${item.product.price}</td>
      </tr>`
      }
      transporter.sendMail({
        from: `${process.env.EMAIL_ACCOUNT}`,
        to: `${order.user.email}`,
        subject: 'Sky Club | 出貨通知',
        html: `
        <div>
          <div style="font-size: 2rem;">Sky Club 商品出貨通知</div>
          <hr>
          <div style="font-size: 1.1rem;font-weight: 600;">尊敬的用戶您好，賣家${order.seller.nickname}(${order.seller._id}) 已將您的商品訂單 ${order._id} 出貨。</div><br>
          <div style="font-size: 1rem;font-weight: 600;">
            <table border="1">
              <tr>
                <td>商品名稱</td>
                <td>商品數量</td>
                <td>商品單價</td>
              </tr>` +
          `${message}` +
          `<tr>
                <td colspan="3">總金額：${order.total}</td>
              </tr>
            </table>
          </div>
          <div><a
          href="https://luciennehuang.github.io/SkyClub/#/member/orders" style="font-size: 2rem;">&gt;&gt;點此查詢訂單詳情</a>
          </div>
          <div style="font-size: 1rem;font-weight: 600;">如果有任何疑問，歡迎<a
          href="https://luciennehuang.github.io/SkyClub/#/contact">聯絡我們</a>。<br>Sky Club 祝您有美好的一天。</div>
        </div>
        `
      }).then(info => {
        console.log({ info })
      }).catch(console.error)
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
