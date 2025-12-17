export function proximaEtapa(etapaAtual) {
  const fluxo = [
    "inicio",
    "perfil",
    "necessidade",
    "apresentacao",
    "comparacao",
    "intencao"
  ];

  const index = fluxo.indexOf(etapaAtual);
  return fluxo[index + 1] || "intencao";
}
