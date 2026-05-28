import express from 'express'
import { createLog } from '../controllers/LogController.js'

const router = express.Router()

router.post(
  '/logs',
  createLog
)

export default router