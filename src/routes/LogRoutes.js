import express from 'express'
import { createLog, ping } from '../controllers/LogController.js'

const router = express.Router()

router.post(
  '/logs',
  createLog
)

router.get(
  '/ping',
  ping
)

export default router