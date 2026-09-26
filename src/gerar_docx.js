const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
  BorderStyle, PageBreak
} = require("docx");

const BASE = path.resolve(__dirname);

function lerScript(nomeArquivo) {
  const caminhoSrc = path.join(BASE, "src", nomeArquivo);
  const caminhoRaiz = path.join(BASE, nomeArquivo);

  if (fs.existsSync(caminhoSrc)) return fs.readFileSync(caminhoSrc, "utf-8");
  if (fs.existsSync(caminhoRaiz)) return fs.readFileSync(caminhoRaiz, "utf-8");
  return `# Arquivo ${nomeArquivo} não localizado.`;
}

const codigoGerarDados = lerScript("gerar_dados.py");
const codigoTreinar = lerScript("treinar_modelo.py");

function titulo(texto, nivel = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text: texto,
    heading: nivel,
    spacing: { before: 300, after: 150 },
  });
}

function paragrafo(texto, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text: texto, ...opts })],
    spacing: { after: 150 },
  });
}

function bullet(texto) {
  return new Paragraph({
    text: texto,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function blocoCodigo(codigo) {
  const linhas = codigo.split("\n");
  return linhas.map(
    (linha) =>
      new Paragraph({
        children: [
          new TextRun({
            text: linha.length ? linha : " ",
            font: "Courier New",
            size: 15,
          }),
        ],
        spacing: { after: 0 },
        shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
      })
  );
}

function imagem(caminho, largura = 500) {
  if (!fs.existsSync(caminho)) {
    return new Paragraph({
      children: [
        new TextRun({
          text: `[Imagem não encontrada em: ${path.basename(caminho)}. Execute o script de treino primeiro.]`,
          italics: true,
          color: "888888",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });
  }

  const dados = fs.readFileSync(caminho);
  return new Paragraph({
    children: [
      new ImageRun({
        data: dados,
        type: "png",
        transformation: { width: largura, height: Math.round(largura * 0.82) },
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });
}

function celula(texto, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 2500, type: WidthType.DXA },
    shading: opts.header
      ? { type: ShadingType.CLEAR, fill: "D9E2F3" }
      : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: texto, bold: !!opts.header, size: 20 }),
        ],
      }),
    ],
  });
}

function tabelaMetricas() {
  const linhas = [
    ["Métrica", "Regressão Linear", "Random Forest"],
    ["MAE (Erro Absoluto Médio)", "0.493", "0.576"],
    ["RMSE (Raiz do Erro Quadrático Médio)", "0.630", "0.724"],
    ["R² (Coef. de Determinação)", "0.814", "0.754"],
  ];
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [4000, 2500, 2500],
    rows: linhas.map(
      (l, i) =>
        new TableRow({
          children: [
            celula(l[0], { header: i === 0, width: 4000 }),
            celula(l[1], { header: i === 0, width: 2500 }),
            celula(l[2], { header: i === 0, width: 2500 }),
          ],
        })
    ),
  });
}

function tabelaEstatisticasErro() {
  const linhas = [
    ["Estatística", "Valor"],
    ["Média do erro (resíduo)", "-0.1025"],
    ["Desvio padrão do erro", "0.6244"],
    ["Intervalo de erro (95%)", "[-1.326 ; 1.121]"],
    ["MAE", "0.4934"],
    ["RMSE", "0.6297"],
    ["R²", "0.8141"],
  ];
  return new Table({
    width: { size: 6500, type: WidthType.DXA },
    columnWidths: [4000, 2500],
    rows: linhas.map(
      (l, i) =>
        new TableRow({
          children: [
            celula(l[0], { header: i === 0, width: 4000 }),
            celula(l[1], { header: i === 0, width: 2500 }),
          ],
        })
    ),
  });
}

function tabelaColunas() {
  const linhas = [
    ["Coluna", "Descrição", "Faixa de valores"],
    ["nome_aluno", "Nome (genérico/fictício) do aluno", "texto"],
    ["horas_estudo_semana", "Horas de estudo por semana", "0 a 20"],
    ["frequencia_pct", "Frequência às aulas (%)", "50 a 100"],
    ["atividades_entregues", "Nº de atividades entregues", "0 a 10"],
    ["nota_anterior", "Nota do período anterior", "0 a 10"],
    ["nota_final", "Nota final (variável alvo)", "0 a 10"],
  ];
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [2800, 3700, 2500],
    rows: linhas.map(
      (l, i) =>
        new TableRow({
          children: [
            celula(l[0], { header: i === 0, width: 2800 }),
            celula(l[1], { header: i === 0, width: 3700 }),
            celula(l[2], { header: i === 0, width: 2500 }),
          ],
        })
    ),
  });
}

function tabelaPredicoesNomes() {
  const linhas = [
    ["Aluno", "Nota Real", "Nota Prevista", "Erro"],
    ["Henrique Teixeira", "2.57", "4.45", "-1.88"],
    ["Tatiane Cardoso", "3.39", "5.15", "-1.76"],
    ["Sérgio Silva 2", "7.58", "6.00", "1.58"],
    ["Rafael Barbosa", "4.52", "5.79", "-1.27"],
    ["João Araújo", "4.02", "5.24", "-1.22"],
    ["Alex Expedito (integrante)", "5.00", "4.98", "0.02"],
  ];
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [3500, 1800, 1900, 1800],
    rows: linhas.map(
      (l, i) =>
        new TableRow({
          children: [
            celula(l[0], { header: i === 0, width: 3500 }),
            celula(l[1], { header: i === 0, width: 1800 }),
            celula(l[2], { header: i === 0, width: 1900 }),
            celula(l[3], { header: i === 0, width: 1800 }),
          ],
        })
    ),
  });
}

const pastaGraficos = path.join(BASE, "graficos");

const doc = new Document({
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 } }, // A4
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "Previsão da Nota Final de Alunos com Machine Learning",
              bold: true,
              size: 40,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Atividade prática — Base de dados fake + Regressão / Random Forest",
              italics: true,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Integrantes: ", bold: true, size: 22 }),
            new TextRun({ text: "Alex Expedito e Matheus Curci", size: 22 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        titulo("1. Objetivo"),
        paragrafo(
          "O objetivo desta atividade é construir uma base de dados fictícia (fake) de alunos e treinar um modelo de Machine Learning capaz de prever a nota final com base em quatro variáveis: horas de estudo semanais, frequência às aulas, quantidade de atividades entregues e a nota do período anterior. Além do treinamento, foram calculadas métricas estatísticas de erro (média, desvio padrão e intervalo de erro) para avaliar a qualidade das previsões."
        ),

        titulo("2. Base de Dados"),
        paragrafo(
          "Foi gerada uma base sintética com 400 alunos, utilizando a biblioteca NumPy para simular valores realistas e um certo grau de ruído (aleatoriedade), como acontece em dados de sala de aula reais. Os nomes dos alunos são genéricos e fictícios (gerados por combinação aleatória de nomes e sobrenomes comuns); como forma de identificar o grupo, os dois primeiros registros da base foram nomeados com os próprios integrantes do trabalho, Alex Expedito e Matheus Curci. As colunas da base são:"
        ),
        tabelaColunas(),
        paragrafo(
          "A nota final foi construída a partir de uma combinação ponderada dessas variáveis (dando mais peso à nota anterior e às atividades entregues) somada a um ruído aleatório, e depois limitada ao intervalo de 0 a 10.",
          {}
        ),

        titulo("3. Código-fonte"),
        paragrafo("3.1. Geração da base de dados (gerar_dados.py)", { bold: true }),
        ...blocoCodigo(codigoGerarDados),
        new Paragraph({ children: [new PageBreak()] }),
        paragrafo("3.2. Treinamento do modelo e cálculo das estatísticas (treinar_modelo.py)", { bold: true }),
        ...blocoCodigo(codigoTreinar),

        new Paragraph({ children: [new PageBreak()] }),
        titulo("4. Modelos Treinados"),
        paragrafo(
          "Foram treinados e comparados dois modelos de regressão, ambos usando 75% dos dados para treino e 25% para teste:"
        ),
        bullet("Regressão Linear — modelo simples e interpretável, assume relação linear entre as variáveis."),
        bullet("Random Forest Regressor — modelo baseado em árvores, capaz de capturar relações não lineares."),
        paragrafo("A tabela abaixo compara o desempenho dos dois modelos no conjunto de teste:"),
        tabelaMetricas(),
        paragrafo(
          "A Regressão Linear apresentou o menor erro (RMSE) e o maior R², sendo escolhida como o melhor modelo. Isso é coerente, já que a nota final foi construída a partir de uma fórmula predominantemente linear das variáveis de entrada."
        ),

        titulo("5. Gráficos"),
        paragrafo("5.1. Valores reais vs. valores previstos", { bold: true }),
        imagem(path.join(pastaGraficos, "1_real_vs_previsto.png")),
        paragrafo(
          "Os pontos concentrados próximos à linha diagonal (previsão perfeita) indicam que o modelo acerta a maior parte das notas com pequena margem de erro."
        ),

        paragrafo("5.2. Distribuição dos erros (resíduos)", { bold: true }),
        imagem(path.join(pastaGraficos, "2_distribuicao_erros.png")),
        paragrafo(
          "O histograma mostra que os erros se concentram próximos de zero e seguem um formato aproximadamente simétrico (parecido com uma distribuição normal), o que é um bom sinal — indica que o modelo não erra sistematicamente para mais ou para menos."
        ),

        paragrafo("5.3. Importância das variáveis (Random Forest)", { bold: true }),
        imagem(path.join(pastaGraficos, "3_importancia_variaveis.png")),
        paragrafo(
          "A nota anterior e as atividades entregues são as variáveis mais relevantes para prever a nota final, seguidas por horas de estudo e, por último, frequência."
        ),

        paragrafo("5.4. Comparação de métricas entre os modelos", { bold: true }),
        imagem(path.join(pastaGraficos, "4_comparacao_modelos.png")),

        titulo("6. Cálculos Estatísticos das Previsões"),
        paragrafo(
          "Utilizando o melhor modelo (Regressão Linear), foram calculados o erro médio, o desvio padrão do erro e o intervalo de erro com 95% de confiança sobre o conjunto de teste (100 alunos não vistos no treinamento):"
        ),
        tabelaEstatisticasErro(),
        paragrafo(
          "Interpretação: em média, o modelo erra apenas -0.10 ponto (praticamente sem viés sistemático para cima ou para baixo — um leve viés de subestimar levemente a nota, mas muito pequeno). O desvio padrão de 0.62 mostra que a maioria dos erros fica entre -0.62 e +0.62 pontos. Já o intervalo de erro de 95% [-1.33 ; 1.12] indica que, ao prever a nota de um novo aluno, há 95% de chance de o erro da previsão estar dentro dessa faixa — ou seja, a nota real deve estar a, no máximo, cerca de 1.1 a 1.3 pontos da nota prevista, na grande maioria dos casos."
        ),

        paragrafo("6.1. Exemplo: previsão por aluno (nome puxado da tabela de dados)", { bold: true }),
        paragrafo(
          "Para tornar os resultados mais concretos, a tabela abaixo mostra o nome do aluno (coluna nome_aluno de dados/alunos.csv), a nota real, a nota prevista pelo modelo e o erro, para os casos com maior erro no conjunto de teste — além da previsão para o integrante Alex Expedito, que também está na base:"
        ),
        tabelaPredicoesNomes(),
        paragrafo(
          "Curiosamente, mesmo com apenas 400 alunos, o modelo previu a nota de Alex Expedito quase perfeitamente (erro de 0.02 ponto), enquanto os maiores erros ficaram concentrados em alunos cujo desempenho fugiu do padrão esperado pelas variáveis utilizadas (por exemplo, poucas horas de estudo mas nota anterior alta, ou o contrário). Isso é esperado: nenhum modelo com apenas quatro variáveis captura 100% dos fatores que afetam o desempenho de um aluno."
        ),

        titulo("7. Análise e Avaliação do Modelo"),
        paragrafo(
          "Considerando que as notas variam de 0 a 10, um erro médio absoluto (MAE) de aproximadamente 0.49 ponto representa um desempenho bastante satisfatório: o modelo erra, em média, apenas cerca de 5% da escala total de notas."
        ),
        paragrafo(
          "O R² de 0.81 indica que cerca de 81% da variação da nota final é explicada pelas quatro variáveis utilizadas (horas de estudo, frequência, atividades entregues e nota anterior), o que é considerado um ajuste forte para um problema de regressão com apenas quatro variáveis."
        ),
        paragrafo(
          "A distribuição dos erros próxima de uma curva normal centrada em zero reforça que o modelo não apresenta viés relevante — ele não tende a superestimar nem subestimar as notas de forma sistemática."
        ),
        paragrafo(
          "Conclusão: para os fins desta atividade (fins didáticos, com dados fictícios), o modelo de Regressão Linear apresentou desempenho aceitável e consistente, sendo adequado para prever a nota final dos alunos com boa precisão. Em um cenário real, seria importante validar o modelo com dados reais de alunos, testar mais variáveis (como acesso a materiais extras, engajamento em fórum, etc.) e reavaliar periodicamente o modelo à medida que novos dados são coletados."
        ),

        titulo("8. Como Executar o Projeto"),
        bullet("1. Instalar as dependências: pip install pandas numpy scikit-learn matplotlib"),
        bullet("2. Executar: python src/gerar_dados.py  (gera a base em dados/alunos.csv)"),
        bullet("3. Executar: python src/treinar_modelo.py  (treina os modelos, imprime as métricas e salva os gráficos em graficos/)"),
        bullet("4. Gerar relatório Word: node gerar_relatorio.js"),

        new Paragraph({
          children: [
            new TextRun({
              text: "Integrantes do grupo: Alex Expedito e Matheus Curci",
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 400 },
        }),
      ],
    },
  ],
});

const arquivoSaida = path.join(BASE, "Relatorio_Previsao_Notas.docx");
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(arquivoSaida, buffer);
  console.log(`Documento gerado com sucesso em: ${arquivoSaida}`);
});