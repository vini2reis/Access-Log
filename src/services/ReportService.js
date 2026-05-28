import nodemailer from 'nodemailer'
import ExcelJS from 'exceljs'
import { logsDatabase, PcsMap, resetDatabase } from '../config/database.js'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

export async function createAndSendReport() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    EMAIL,
    PASSWORD,
    SEND_TO
  } = process.env
  
  console.log('A iniciar rotina automática de fecho diário corrigida...')

  if (logsDatabase.length === 0) {
    console.log('Nenhum log registado hoje.')

    return
  }

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Acessos por Máquina')
    worksheet.views = [{ showGridLines: true }]

    
    worksheet.mergeCells('A1:F1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = 'RELATÓRIO DIÁRIO DE LOGINS GOOGLE POR MÁQUINA'
    titleCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F497D' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getRow(1).height = 40

    
    const headers = ["Computador", "IP da Máquina", "E-mail Conectado", "Data / Hora", "Navegador", "URL de Origem"]
    worksheet.addRow([]) 
    const headerRow = worksheet.addRow(headers)
    worksheet.getRow(3).height = 25

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2C3E50' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top: { style: 'thin', color: { argb: 'BDC3C7' } }, bottom: { style: 'thin', color: { argb: 'BDC3C7' } },
        left: { style: 'thin', color: { argb: 'BDC3C7' } }, right: { style: 'thin', color: { argb: 'BDC3C7' } }
      }
    })

    
    const recordedLogs = logsDatabase.map(log => ({
      ...log,
      pcNumber: PcsMap[log.ip] || "Desconhecido"
    }))

    recordedLogs.sort((a, b) => a.pcNumber.localeCompare(b.pcNumber))

    const pcGroups = {}
    recordedLogs.forEach((log) => {
      if (!pcGroups[log.pcNumber]) {
        pcGroups[log.pcNumber] = []
      }
      pcGroups[log.pcNumber].push(log)
    })

    let currentLine = 4

    Object.keys(pcGroups).forEach((pcName) => {
      const pcLogs = pcGroups[pcName]
      const initialLine = currentLine
      const finalLine = initialLine + pcLogs.length - 1

      pcLogs.forEach((log, index) => {
        const pcValue = (index === 0) ? pcName : null

        const row = worksheet.addRow([
          pcValue,
          log.ip,
          log.email,
          log.date,
          log.browser,
          log.origin
        ])
        worksheet.getRow(currentLine).height = 22

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.font = { name: 'Segoe UI', size: 10 }
          cell.border = {
            top: { style: 'thin', color: { argb: 'E0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
            left: { style: 'thin', color: { argb: 'BDC3C7' } },
            right: { style: 'thin', color: { argb: 'BDC3C7' } }
          }
          
          if ([1, 2, 4, 5].includes(colNumber)) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' }
          }
        })

        currentLine++
      })

      
      if (pcLogs.length > 1) {
        worksheet.mergeCells(`A${initialLine}:A${finalLine}`)
      }

      
      const firstCell = worksheet.getCell(`A${initialLine}`)
      firstCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1F497D' } }
      firstCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F4F4' } }
      firstCell.alignment = { horizontal: 'center', vertical: 'middle' }

      
      for (let col = 1; col <= 6; col++) {
        const finalCell = worksheet.getCell(finalLine, col)
        finalCell.border = {
          ...finalCell.border,
          bottom: { style: 'medium', color: { argb: '2C3E50' } } 
        }
      }
    })

    worksheet.columns.forEach(column => {
      let maxColumnLength = 0
      column.eachCell({ includeEmpty: false }, cell => {
        if (cell.row !== 1) {
          const cellLength = cell.value ? cell.value.toString().length : 0
          if (cellLength > maxColumnLength) maxColumnLength = cellLength
        }
      })
      column.width = maxColumnLength < 15 ? 15 : maxColumnLength + 5
    })

    const filePath = path.resolve(__dirname, '../../access_logs/relatorio_acessos_agrupado.xlsx')
    await workbook.xlsx.writeFile(filePath)

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '465'),
      secure: true,
      auth: { user: EMAIL, pass: PASSWORD }
    })

    const now = new Date().toLocaleDateString('pt-BR')
    await transporter.sendMail({
      from: `"Auditoria de TI" <${EMAIL}>`,
      to: SEND_TO,
      subject: `[Logs] Auditoria de Acessos Google - ${now}`,
      text: `Segue em anexo o relatório diário corrigido e organizado por computador na data de hoje (${now}).`,
      attachments: [{ filename: `Relatorio_Acessos_Google_${now.replace(/\//g, '-')}.xlsx`, path: filePath }]
    })

    console.log('Relatório corrigido e enviado com sucesso por e-mail!')

    // resetDatabase()

  } catch (erro) {
      console.error('Falha crítica ao executar a rotina do Excel:', erro)
  }
}