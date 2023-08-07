import { Router } from 'express'
import contentType from '../middlewares/contentType.js'
import { register, login, logout, extend, getProfile, editProfile, getAll } from '../controllers/users.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'
import admin from '../middlewares/admin.js'

const router = Router()

router.post('/', contentType('application/json'), register)
router.post('/login', contentType('application/json'), auth.login, login)
router.delete('/logout', auth.jwt, logout)
router.patch('/extend', auth.jwt, extend)
router.get('/profile', auth.jwt, getProfile)
// 只有管理員才可以取得所有會員的資訊
router.get('/all', auth.jwt, admin, getAll)
router.patch('/:id', auth.jwt, upload, editProfile)

export default router
