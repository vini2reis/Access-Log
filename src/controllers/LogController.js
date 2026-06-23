import { json } from 'express'
import { logsDatabase } from '../config/database.js'
import { clearUrl } from '../helpers/clearUrl.js'

export const ping = (req, res) => {
  return res.status(200).json({ message: 'pong' })
}

export const createLog = (req, res) => {
  try {
    let ipClient = req.ip

    const { ip, email, browser, origin, type } = req.body
    const formatUrl = clearUrl(origin)

    const brazilTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).format(new Date()).replace(', ', ' ')

    const date = brazilTime
    const actualTimestamp = new Date().getTime()

    const lastRegister = [...logsDatabase].reverse().find(log => log.email === email && log.ip === ip)

    if (type === 'login') {
      if (lastRegister) {
        const difTime = actualTimestamp - lastRegister.register_time
        const oneHourMs = 60 * 60 * 1000

        if (difTime < oneHourMs) {
          if (!lastRegister.origin.includes(formatUrl)) {
            lastRegister.origin.push(formatUrl)
          }
          console.log(`[LOGIN REPETIDO - IGNORADO] Adicionado apenas ao histórico existente: ${email}`);
          return res.status(200).json({ mensagem: 'Login repetido dentro da janela de 1h. Histórico atualizado.' });
        }
      }

      const newLog = {
        ip,
        email,
        date,
        browser,
        origin: [formatUrl],
        register_time: actualTimestamp
      }

      logsDatabase.push(newLog)
      console.log(`[LOG RECUPERADO] Máquina: ${ipClient} | Usuário: ${email}`)

      return res.status(201).json({ mensagem: 'Log registrado com sucesso!' })
    }

    if (lastRegister) {
      if (!lastRegister.origin.includes(formatUrl)) {
        lastRegister.origin.push(formatUrl)
      }

      console.log(`[HISTÓRICO] Site adicionado ao usuário ${email}: ${origin}`)
      return res.status(200).json({ mensagem: 'Site adicionado ao histórico do usuário.' })
    }

    const newLog = {
      ip,
      email,
      date,
      browser,
      origin: [formatUrl],
      register_time: actualTimestamp
    }

    logsDatabase.push(newLog)
    console.log(logsDatabase)
    return res.status(201).json({ mensagem: 'Registro criado a partir de navegação avulsa.' })
  } catch (error) {
      console.error('Erro ao processar recepção do log:', error)
      return res.status(500).json({ erro: 'Erro interno no servidor' })
  }
}