import { StatusCodes } from 'http-status-codes'
import nodemailer from 'nodemailer'
import { getMessageFromValidationError } from '../utils/error.js'
import orders from '../models/oders.js'
import users from '../models/users.js'
import products from '../models/products.js'

export const create = async (req, res) => {
  try {
    // 檢查購物車是不是空的
    console.log(req.body)
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
        for (const product of user.cart[miniCart].productCart) {
          if ((product.product.MaxNumber - product.quantity === 0)) {
            await products.findByIdAndUpdate(product.product._id, {
              MaxNumber: (product.product.MaxNumber - product.quantity),
              sell: false
            })
          } else {
            await products.findByIdAndUpdate(product.product._id, {
              MaxNumber: (product.product.MaxNumber - product.quantity)
            })
          }
        }

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
        console.log(result._id.toString())
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
        await transporter.sendMail({
          from: `${process.env.EMAIL_ACCOUNT}`,
          to: `${user.cart[miniCart].seller.email}`,
          subject: 'Sky Club | 商品售出通知',
          html:

            `<!DOCTYPE html>
            <html>
            
            <head>
              <title></title>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <style type="text/css">
                body,
                table,
                td,
                a {
                  -webkit-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
                }
            
                table,
                td {
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                }
            
                img {
                  -ms-interpolation-mode: bicubic;
                }
            
                img {
                  border: 0;
                  height: auto;
                  line-height: 100%;
                  outline: none;
                  text-decoration: none;
                }
            
                table {
                  border-collapse: collapse !important;
                }
            
                body {
                  height: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                }
            
                a[x-apple-data-detectors] {
                  color: inherit !important;
                  text-decoration: none !important;
                  font-size: inherit !important;
                  font-family: inherit !important;
                  font-weight: inherit !important;
                  line-height: inherit !important;
                }
            
                @media screen and (max-width: 480px) {
                  .mobile-hide {
                    display: none !important;
                  }
            
                  .mobile-center {
                    text-align: center !important;
                  }
                }
            
                div[style*="margin: 16px 0;"] {
                  margin: 0 !important;
                }
              </style>
            
            <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                      <tr>
                        <td align="center" valign="top" style="font-size:0; padding: 35px;" bgcolor="#B0A9EC">
                          <div style="display:inline-block; max-width:100%; min-width:100px; vertical-align:top; width:100%;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:100%;">
                              <tr>
                                <td align="center" valign="top"
                                  style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 48px;"
                                  class="mobile-center">
                                  <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: #ffffff;">Sky Club</h1>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                            <tr>
                              <td align="center"
                                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                                <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                                  您有一份新的訂單</h2>
                              </td>
                            </tr>
                            <tr>
                              <td align="left"
                                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                                <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                                  親愛的會員您好，您的商品已售出，訂單已建立（編號：${result._id.toString()}），訂單內容簡要如下，如需更多資訊，您可登入官網在會員後台查詢您的<a
                                    href="https://luciennehuang.github.io/SkyClub/#/member/sales">出售訂單</a>。<br><br>請您於確認訂單後開始著手安排出貨，並寄出商品。
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td align="left" style="padding-top: 20px;">
                                <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="50%" align="left" bgcolor="#eeeeee"
                                      style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                      名稱</td>
                                    <td width="25%" align="left" bgcolor="#eeeeee"
                                      style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                      數量</td>
                                    <td width="25%" align="left" bgcolor="#eeeeee"
                                      style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                      單價</td>
                                  </tr>` +
            `${message}` +
            `</table>
            </td>
          </tr>
          <tr>
            <td align="left" style="padding-top: 20px;">
              <table cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td width="75%" align="left"
                    style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                    總金額 </td>
                  <td width="25%" align="left"
                    style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                    ${sum}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style=" padding: 20px 35px 35px 35px; background-color: #B0A9EC;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
          <tr>
            <td align="center"
              style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
              <h2 style="font-size: 24px; font-weight: 800; line-height: 30px; color: #ffffff; margin: 0;">
                如果有任何疑問，歡迎聯絡我們！</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 25px 0 5px 0;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 5px;"> <a
                      href="https://luciennehuang.github.io/SkyClub/#/contact" target="_blank"
                      style="font-size: 18px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; background-color: #786fc7; padding: 15px 30px; border: 1px solid #786fc7; display: block;">聯絡我們</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 20px 10px 20px;background:#3d367c;">
        <table role="presentation"
          style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
          <tr>
            <td style="padding:0;width:50%;" align="left">
            </td>
            <td style="padding:0;width:50%;" align="right">
              <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                <tr>
                  <td style="padding:0 0 0 10px;width:38px;">
                    <a href="https://luciennehuang.github.io/SkyClub/#/" style="color:#ffffff;"><img
                        src="https://res.cloudinary.com/dymjlgamb/image/upload/v1692752542/sky-logo-white_tl8ufk.png"
                        alt="SkyClub" width="40" style="height:auto;display:block;border:0;" /></a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</td>
</tr>
</table>
</body>

</html>`
        })
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
        message += `
        <tr>
          <td width="50%" align="left"
            style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
            ${item.product.name}
          </td>
          <td width="25%" align="left"
            style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
            ${item.quantity}
          </td>
          <td width="25%" align="left"
            style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
            ${item.product.price}
          </td>
        </tr>`
      }
      await transporter.sendMail({
        from: `${process.env.EMAIL_ACCOUNT}`,
        to: `${order.user.email}`,
        subject: 'Sky Club | 商品出貨通知',
        html: `
        <!DOCTYPE html>
<html>

<head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <style type="text/css">
    body,
    table,
    td,
    a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      -ms-interpolation-mode: bicubic;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    table {
      border-collapse: collapse !important;
    }

    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    @media screen and (max-width: 480px) {
      .mobile-hide {
        display: none !important;
      }

      .mobile-center {
        text-align: center !important;
      }
    }

    div[style*="margin: 16px 0;"] {
      margin: 0 !important;
    }
  </style>

<body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
          <tr>
            <td align="center" valign="top" style="font-size:0; padding: 35px;" bgcolor="#A6D8D4">
              <div style="display:inline-block; max-width:100%; min-width:100px; vertical-align:top; width:100%;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:100%;">
                  <tr>
                    <td align="center" valign="top"
                      style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 48px;"
                      class="mobile-center">
                      <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: #ffffff;">Sky Club</h1>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                <tr>
                  <td align="center"
                    style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                    <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                      您訂購的商品已出貨</h2>
                  </td>
                </tr>
                <tr>
                  <td align="left"
                    style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                    <!-- 買家名稱 -->
                    <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                      親愛的會員您好，賣家${order.seller.nickname}(${order.seller._id}) 已將您的商品訂單 ${order._id}
                      出貨。訂單內容簡要如下，如需更多資訊，您可登入官網在會員後台查詢您的<a
                        href="https://luciennehuang.github.io/SkyClub/#/member/orders">購買訂單</a>。
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding-top: 20px;">
                    <table cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="50%" align="left" bgcolor="#eeeeee"
                          style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                          名稱</td>
                        <td width="25%" align="left" bgcolor="#eeeeee"
                          style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                          數量</td>
                        <td width="25%" align="left" bgcolor="#eeeeee"
                          style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                          單價</td>
                      </tr>` +
          `${message}` +
          `
          </table>
        </td>
      </tr>
      <tr>
        <td align="left" style="padding-top: 20px;">
          <table cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="75%" align="left"
                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                總金額 </td>
              <td width="25%" align="left"
                style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                ${order.total}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td align="center" style=" padding: 20px 35px 35px 35px; background-color: #A6D8D4;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
      <tr>
        <td align="center"
          style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
          <h2 style="font-size: 24px; font-weight: 800; line-height: 30px; color: #ffffff; margin: 0;">
            歡迎點選以下連結，挖掘更多商品！</h2>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 25px 0 5px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;"> <a
                  href="https://luciennehuang.github.io/SkyClub/#/trade" target="_blank"
                  style="font-size: 18px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; background-color: #3b9189; padding: 15px 30px; border: 1px solid #3b9189; display: block;">交易專區</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:10px 20px 10px 20px;background:#1b504b;">
    <table role="presentation"
      style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
      <tr>
        <td style="padding:0;width:50%;" align="left">
        </td>
        <td style="padding:0;width:50%;" align="right">
          <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
            <tr>
              <td style="padding:0 0 0 10px;width:38px;">
                <a href="https://luciennehuang.github.io/SkyClub/#/" style="color:#ffffff;"><img
                    src="https://res.cloudinary.com/dymjlgamb/image/upload/v1692752542/sky-logo-white_tl8ufk.png"
                    alt="SkyClub" width="40" style="height:auto;display:block;border:0;" /></a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
</table>
</td>
</tr>
</table>
</body>

</html>`
      })
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
