import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { StatusCodes } from 'http-status-codes'

// 設定 cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

// 設定 upload
const upload = multer({
  // 設定儲存位置
  storage: new CloudinaryStorage({ cloudinary }),
  // 設定只接收哪種檔案
  fileFilter (req, file, callback) {
    if (['image/jpg', 'image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(null, true)
    } else {
      callback(new multer.MulterError('LIMIT_FILE_FORMAT'), false)
    }
  },
  // 設定檔案大小
  // 只允許 1 MB
  limits: {
    fieldSize: 1024 * 1024
  }
})

export default (req, res, next) => {
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'image', maxCount: 1 }, { name: 'images', maxCount: 6 }])(req, res, error => {
    if (error instanceof multer.MulterError) {
      let message = '上傳錯誤'
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = '檔案太大'
      } else if (error.code === 'LIMIT_FILE_FORMAT') {
        message = '檔案格式錯誤'
      }
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else if (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    } else {
      next()
    }
  })
}
