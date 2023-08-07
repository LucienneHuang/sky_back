import { Router } from 'express'
import contentType from '../middlewares/contentType.js'
import { sendMessage, getMessage, editCheckInfo } from '../controllers/contactUs.js'
import * as auth from '../middlewares/auth.js'
import admin from '../middlewares/admin.js'
const router = Router()

router.post('/', contentType('application/json'), sendMessage)
router.get('/get', auth.jwt, admin, getMessage)
router.patch('/:id', auth.jwt, contentType('application/json'), editCheckInfo)

export default router
