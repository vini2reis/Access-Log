import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import logRoutes from '../routes/LogRoutes.js'
import { createAndSendReport } from '../services/ReportService.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', logRoutes)

cron.schedule('0 23 * * 1-5', () => {
  createAndSendReport()
}, {
  scheduled: true,
  timezone: 'America/Sao_Paulo'
})

export default app