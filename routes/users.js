import { Router } from 'express'
import contentType from '../middlewares/contentType.js'
import { register, login, logout, extend, getProfile, editProfile, getAll, getBlock, userManage, getCart, editCart } from '../controllers/users.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'
import admin from '../middlewares/admin.js'

const router = Router()

router.post('/', contentType('application/json'), register)
router.post('/login', contentType('application/json'), auth.login, login)
router.delete('/logout', auth.jwt, logout)
router.patch('/extend', auth.jwt, extend)
router.get('/profile', auth.jwt, getProfile)
router.get('/block', getBlock)
// 只有管理員才可以取得所有會員的資訊
router.get('/all', auth.jwt, admin, getAll)
// 只有管理員才能 block 使用者
router.patch('/all/:id', auth.jwt, admin, upload, contentType('multipart/form-data'), userManage)
router.patch('/:id', auth.jwt, upload, editProfile)

// 購物車
router.get('/cart', auth.jwt, getCart)
router.post('/cart', contentType('application/json'), auth.jwt, editCart)

export default router
