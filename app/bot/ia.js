import fetch from "node-fetch";

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

export async function analisarIntencaoIA(texto) {
  const prompt = `
Classifique a intenção do cliente em apenas UMA palavra:
- informacao
- comparacao
- interesse
- fechamento

Mensagem:
"${texto}"

Responda apenas com a palavra.
`;

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0,
          max_new_tokens: 5
        }
      })
    }
  );

  const result = await response.json();
  const textoGerado = result[0]?.generated_text?.toLowerCase() || "";

  if (textoGerado.includes("fechamento")) return "fechamento";
  if (textoGerado.includes("interesse")) return "interesse";
  if (textoGerado.includes("comparacao")) return "comparacao";

  return "informacao";
}
