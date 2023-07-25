import { Router } from 'express'
import contentType from '../middlewares/contentType.js'
const router = Router()

router.post('/', contentType('application/json'))

export default router
