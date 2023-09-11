// 開商品的路由
import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'
import contentType from '../middlewares/contentType.js'
import { create, getAll, getOwn, get, getId, editOwnProduct, getUserProducts, editBlockUserProduct } from '../controllers/products.js'
import admin from '../middlewares/admin.js'

const router = Router()
// 先驗證有沒有 jwt，再驗證請求格式對不對，再處理他上傳的檔案，再進入到 create 的 function
router.post('/', auth.jwt, contentType('multipart/form-data'), upload, create)

// 只有管理員才能看到所有人的商品
router.get('/all', auth.jwt, admin, getAll)
// 會員只能看到自己的商品
router.get('/own', auth.jwt, getOwn)
// 給前端看的
router.get('/', get)
// 取 id
router.get('/:id', getId)

// 取 user
router.get('/user/:id', getUserProducts)

// 編輯/更新
router.patch('/:id', auth.jwt, contentType('multipart/form-data'), upload, editOwnProduct)
// 停權下架
router.patch('/block/:id', auth.jwt, contentType('multipart/form-data'), upload, editBlockUserProduct)

export default router
