import path from 'path'
import { fileURLToPath } from 'url'
import qrcode from 'qrcode-terminal'
import express from 'express'
import basicAuth from 'express-basic-auth'
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { responderMensagem } from './responder.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let sock

async function startSock() {
  console.log('Iniciando bot...')

  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info'))

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '22.04.4']
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('QR Code recebido, escaneie abaixo:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error instanceof Boom ? lastDisconnect.error.output.statusCode : 0
      const reason = DisconnectReason[statusCode] || statusCode
      console.log('Conexão fechada, motivo:', reason)
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log('Tentando reconectar...')
        startSock()
      }
    }

    if (connection === 'open') {
      console.log('Conectado ao WhatsApp ✅')
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    if (!messages || messages.length === 0) return
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text
    if (!texto) return

    console.log(`Mensagem recebida de ${from}: ${texto}`)

    try {
      const resposta = await responderMensagem(texto, from)

      if (resposta) {
        if (Array.isArray(resposta)) {
          for (const msg of resposta) {
            await sock.sendMessage(from, { text: msg })
          }
        } else {
          await sock.sendMessage(from, { text: resposta })
        }
      }
    } catch (err) {
      console.error('Erro ao responder mensagem:', err)
      await sock.sendMessage(from, { text: 'Desculpe, ocorreu um erro ao buscar as informações. Tente novamente mais tarde.' })
    }
  })
}

await startSock()

// Servidor Express
const app = express()

app.use(express.static(path.join(__dirname, '../../public')))

app.use('/sou-cliente', basicAuth({
  users: { 'empresaX': 'senha123' },
  challenge: true,
  unauthorizedResponse: 'Acesso não autorizado'
}))

app.use('/sou-cliente', express.static(path.join(__dirname, '../../painel-cliente')))

app.get('/api/sendToLead', async (req, res) => {
  const { to, message } = req.query
  if (!to || !message) return res.status(400).send('Parâmetros to e message obrigatórios')

  try {
    await sock.sendMessage(`${to}@s.whatsapp.net`, { text: message })
    res.send('Mensagem enviada para lead.')
  } catch (e) {
    res.status(500).send('Erro ao enviar mensagem: ' + e.message)
  }
})

app.listen(3000, () => {
  console.log('Painel rodando em http://localhost:3000')
})
