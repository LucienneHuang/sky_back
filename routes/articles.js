import { Router } from 'express'
import contentType from '../middlewares/contentType.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'
import admin from '../middlewares/admin.js'
import { create, getAll, getRealms, getNews, editArticle, deleteArticle } from '../controllers/articles.js'

const router = Router()

router.post('/', auth.jwt, admin, contentType('multipart/form-data'), upload, create)
router.get('/all', auth.jwt, admin, getAll)
router.get('/getRealms', getRealms)
router.get('/getNews', getNews)
router.patch('/:id', auth.jwt, admin, upload, contentType('multipart/form-data'), editArticle)
router.delete('/:id', auth.jwt, admin, deleteArticle)

export default router
