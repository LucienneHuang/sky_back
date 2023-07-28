// 驗證資料的 content type 是否正確
import { StatusCodes } from 'http-status-codes'
/**
 * 檢查請求的 content-type 格式
 * @param {string} type content-type 格式
 * @returns express middleware function
 */

// 根據我傳進來的 content type 的型態的文字
export default (type) => {
  // 回傳一個 function 他是動態的 express 的 middleware
  return (req, res, next) => {
    // 如果 req 的 headers 沒有 content-type  或是如果我的 content-type 沒有包含我傳進來的 type 的話，會出現格式錯誤
    // 如果符合就會通過
    if (
      !req.headers['content-type'] ||
      !req.headers['content-type'].includes(type)
    ) {
      // 回傳狀態碼
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '格式錯誤'
      })
      return
    }
    next()
  }
}
