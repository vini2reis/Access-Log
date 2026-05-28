import dotenv from 'dotenv'
dotenv.config()

import app from './app/app.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Servidor em ES Modules ativo na porta ${PORT}`))
