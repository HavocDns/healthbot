import fetch from "node-fetch";

const HF_API_KEY = process.env.HF_API_KEY;
// Modelo gratuito e estável
const MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

export async function perguntarHF(pergunta) {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `Responda de forma clara e objetiva:\n${pergunta}`
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Erro HF:", data.error);
      return "Estou com instabilidade no momento. Tente novamente.";
    }

    return data[0]?.generated_text || "Não consegui gerar resposta.";
  } catch (err) {
    console.error("Erro HuggingFace:", err);
    return "Erro ao consultar a IA.";
  }
}
