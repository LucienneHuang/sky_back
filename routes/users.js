import { Router } from 'express'
import contentType from '../middlewares/contentType.js'
import { register } from '../controllers/users.js'
const router = Router()

router.post('/', contentType('application/json'), register)

export default router
