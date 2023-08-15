import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import admin from '../middlewares/admin.js'
import { create, get, getAll } from '../controllers/orders.js'

const router = Router()
// 使用者自己新增
router.post('/', auth.jwt, create)
// 使用者取自己
router.get('/', auth.jwt, get)
// 賣家取所有買家
// ??????
// 管理員取所有
router.get('/all', auth.jwt, admin, getAll)
export default router
