import express from 'express'
import cron from 'node-cron'
import logRoutes from '../routes/LogRoutes.js'
import { createAndSendReport } from '../services/ReportService.js'

const app = express()

app.use(express.json())

app.use('/api', logRoutes)

cron.schedule('26 05 * * 1-5', () => {
  createAndSendReport()
})

export default app