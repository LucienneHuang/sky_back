import { Router } from 'express'
import contentType from '../middlewares/contentType.js'
import { sendMessage, getMessage } from '../controllers/contactUs.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', contentType('application/json'), sendMessage)
router.get('/getMessage', auth.jwt, getMessage)

export default router
