export const planos = {
  unimed: {
    nome: "Unimed",
    tipos: {
      individual: {
        faixaValor: "A partir de R$ 350",
        cobertura: [
          "Consultas",
          "Exames",
          "Internações",
          "Urgência e emergência"
        ],
        abrangencia: "Regional ou nacional (dependendo do plano)"
      },
      familiar: {
        faixaValor: "A partir de R$ 900",
        cobertura: [
          "Consultas",
          "Exames",
          "Internações",
          "Maternidade",
          "Urgência e emergência"
        ],
        abrangencia: "Regional ou nacional"
      }
    }
  },

  amil: {
    nome: "Amil",
    tipos: {
      individual: {
        faixaValor: "A partir de R$ 320",
        cobertura: [
          "Consultas",
          "Exames",
          "Internações"
        ],
        abrangencia: "Nacional"
      },
      familiar: {
        faixaValor: "A partir de R$ 850",
        cobertura: [
          "Consultas",
          "Exames",
          "Internações",
          "Maternidade"
        ],
        abrangencia: "Nacional"
      }
    }
  }
};
