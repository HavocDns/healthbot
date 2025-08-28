import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ajuste o caminho para o arquivo clients.json, relativo a app/bot/
const clientsFilePath = path.join(__dirname, '..', 'data', 'clients.json')

let conversas = []

try {
  const data = fs.readFileSync(clientsFilePath, 'utf-8')
  conversas = JSON.parse(data)
  console.log(`Arquivo clients.json carregado com sucesso. ${conversas.length} conversas lidas.`)
} catch (err) {
  console.error('Erro ao carregar arquivo clients.json:', err)
}

// Estado das conversas
let estadoConversa = {}

function resetarEstado(numero) {
  estadoConversa[numero] = {
    apresentou: false,
    tipoPlano: null,
    operadora: null
  }
}

function montarMensagemInicial() {
  return (
    "Olá! 👋 Sou sua assistente especializada em planos de saúde.\n" +
    "Trabalhamos com as principais operadoras do mercado:\n" +
    "- 🏥 Unimed\n- 🩺 Amil\n- 💼 SulAmérica\n- ❤️ Hapvida\n- 🏦 Bradesco Saúde\n\n" +
    "Você procura um plano Individual, Familiar ou Empresarial? Me diga e eu te ajudo!"
  )
}

function montarRespostaOperadora(tipoPlano, operadora) {
  return `Buscando informações sobre o plano *${operadora}* do tipo *${tipoPlano}*...\nAguarde um instante enquanto localizo os benefícios e coberturas mais atualizados.`
}

async function buscarInfoSerp(tipoPlano, operadora) {
  const query = `Plano de saúde ${operadora} ${tipoPlano} coberturas e benefícios 2025 site:br`
  const serpApiKey = process.env.SERPAPI_KEY

  const response = await fetch(
    `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&engine=google&api_key=${serpApiKey}`
  )

  const data = await response.json()

  if (!data.organic_results || data.organic_results.length === 0) {
    return "⚠️ Não encontrei informações atualizadas no momento. Posso te encaminhar para um consultor humano?"
  }

  let resultado = `📊 Informações sobre *${operadora}* (${tipoPlano}):\n\n`
  data.organic_results.slice(0, 3).forEach((res) => {
    resultado += `🔹 *${res.title}*\n${res.snippet}\n${res.link}\n\n`
  })

  resultado +=
    "💬 Os valores exatos podem variar de acordo com sua idade e região.\n" +
    "Vou te encaminhar para um dos nossos especialistas para uma simulação sem compromisso. Tudo bem?"

  return resultado
}

async function responderMensagem(mensagem, numero) {
  if (!estadoConversa[numero]) {
    resetarEstado(numero)
  }

  const estado = estadoConversa[numero]
  const msg = mensagem.toLowerCase()

  if (!estado.apresentou) {
    estado.apresentou = true
    return montarMensagemInicial()
  }

  if (!estado.tipoPlano && ["individual", "familiar", "empresarial"].some(tp => msg.includes(tp))) {
    estado.tipoPlano = ["individual", "familiar", "empresarial"].find(tp => msg.includes(tp))
    return "Certo! Agora me diga, você tem preferência por alguma das operadoras: Unimed, Amil, SulAmérica, Hapvida ou Bradesco Saúde?"
  }

  if (estado.tipoPlano && !estado.operadora && ["unimed", "amil", "sulamérica", "hapvida", "bradesco"].some(op => msg.includes(op))) {
    estado.operadora = ["Unimed", "Amil", "SulAmérica", "Hapvida", "Bradesco Saúde"].find(op => msg.includes(op.toLowerCase()))

    const aguardeMsg = montarRespostaOperadora(estado.tipoPlano, estado.operadora)
    const resultado = await buscarInfoSerp(estado.tipoPlano, estado.operadora)

    // Retorna as duas mensagens em sequência
    return [aguardeMsg, resultado]
  }

  if (estado.tipoPlano && estado.operadora) {
    return await buscarInfoSerp(estado.tipoPlano, estado.operadora)
  }

  return "Por favor, diga se está buscando um plano Individual, Familiar ou Empresarial."
}

export { responderMensagem }
