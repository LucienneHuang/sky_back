import { Router } from 'express'
import contentType from '../middlewares/contentType.js'
import { register, login, logout, extend, getProfile } from '../controllers/users.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', contentType('application/json'), register)
router.post('/login', contentType('application/json'), auth.login, login)
router.delete('/logout', auth.jwt, logout)
router.patch('/extend', auth.jwt, extend)
router.get('/profile', auth.jwt, getProfile)

export default router
