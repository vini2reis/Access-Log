import { logsDatabase } from '../config/database.js'

export const createLog = (req, res) => {
  try {
    let ipClient = req.ip

    const { email, date, browser, origin } = req.body

    const newLog = {
      ip: ipClient,
      email: email,
      date: date || new Date().toLocaleString(),
      browser: browser,
      origin: origin
    }

    logsDatabase.push(newLog)
    console.log(`[LOG RECUPERADO] Máquina: ${ipClient} | Usuário: ${email}`)
    console.log(logsDatabase)

    return res.status(201).json({ mensagem: 'Log registrado com sucesso!' })
  } catch (error) {
    console.error('Erro ao processar recepção do log:', error)

    return res.status(500).json({ erro: 'Erro interno no servidor' })
  }
}