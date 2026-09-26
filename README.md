# Previsão da Nota Final de Alunos com Machine Learning

Atividade prática de Machine Learning: geração de uma base de dados fake de
alunos e treinamento de um modelo capaz de prever a nota final com base em
horas de estudo, frequência, atividades entregues e nota anterior.

**Integrantes:** Alex Expedito e Matheus Curci

## Estrutura do projeto

```
.
├── src/
│   ├── gerar_dados.py      # Gera a base fake de alunos (dados/alunos.csv)
│   ├── treinar_modelo.py   # Treina os modelos, calcula métricas e gera gráficos
│   └── gerar_docx.js       # Gera o relatório em Word (Relatorio_Previsao_Notas.docx)
├── dados/
│   ├── alunos.csv              # Base de dados gerada (400 alunos)
│   └── resumo_resultados.txt   # Resumo das métricas e estatísticas
├── graficos/
│   ├── 1_real_vs_previsto.png
│   ├── 2_distribuicao_erros.png
│   ├── 3_importancia_variaveis.png
│   └── 4_comparacao_modelos.png
└── Relatorio_Previsao_Notas.docx   # Relatório final (código + gráficos + análise)
```

## Como executar

```bash
pip install pandas numpy scikit-learn matplotlib

python src/gerar_dados.py       # gera dados/alunos.csv
python src/treinar_modelo.py    # treina os modelos e gera os gráficos
```

## Resumo dos resultados

- Modelos comparados: Regressão Linear e Random Forest Regressor.
- Melhor modelo: **Regressão Linear** (RMSE = 0.630, R² = 0.814).
- Erro médio das previsões: **-0.10** (praticamente sem viés).
- Desvio padrão do erro: **0.62**.
- Intervalo de erro (95%): **[-1.33 ; 1.12]** pontos, numa escala de notas de 0 a 10.

Com MAE ≈ 0.49 (cerca de 5% da escala de notas) e R² ≈ 0.81, o modelo é
considerado adequado para os fins didáticos desta atividade. Detalhes da
interpretação estão no relatório em Word.

## Observação sobre os nomes

Os nomes dos alunos na base (`nome_aluno`) são genéricos/fictícios, gerados
por combinação aleatória de nomes e sobrenomes comuns. Os dois primeiros
registros foram nomeados com os integrantes do grupo (Alex Expedito e
Matheus Curci) como identificação do trabalho.
