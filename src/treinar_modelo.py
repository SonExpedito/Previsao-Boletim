import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

np.random.seed(42)

DIRETORIO_BASE = Path(__file__).resolve().parent if "__file__" in locals() else Path.cwd()
PASTA_DADOS = DIRETORIO_BASE / "dados"
PASTA_GRAFICOS = DIRETORIO_BASE / "graficos"

PASTA_DADOS.mkdir(parents=True, exist_ok=True)
PASTA_GRAFICOS.mkdir(parents=True, exist_ok=True)

caminho_csv_entrada = PASTA_DADOS / "alunos.csv"

if not caminho_csv_entrada.exists() and (DIRETORIO_BASE / "alunos.csv").exists():
    caminho_csv_entrada = DIRETORIO_BASE / "alunos.csv"

df = pd.read_csv(caminho_csv_entrada)

features = ["horas_estudo_semana", "frequencia_pct", "atividades_entregues", "nota_anterior"]
alvo = "nota_final"

X = df[features]
y = df[alvo]
nomes = df["nome_aluno"]

X_train, X_test, y_train, y_test, nomes_train, nomes_test = train_test_split(
    X, y, nomes, test_size=0.25, random_state=42
)

modelo_linear = LinearRegression()
modelo_linear.fit(X_train, y_train)
pred_linear = modelo_linear.predict(X_test)

modelo_rf = RandomForestRegressor(n_estimators=300, random_state=42, max_depth=6)
modelo_rf.fit(X_train, y_train)
pred_rf = modelo_rf.predict(X_test)


def metrificar(y_true, y_pred, nome):
    mae = mean_absolute_error(y_true, y_pred)
    try:
        from sklearn.metrics import root_mean_squared_error
        rmse = root_mean_squared_error(y_true, y_pred)
    except ImportError:
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        
    r2 = r2_score(y_true, y_pred)
    print(f"\n--- {nome} ---")
    print(f"MAE  (Erro Absoluto Médio): {mae:.3f}")
    print(f"RMSE (Raiz do Erro Quadrático Médio): {rmse:.3f}")
    print(f"R²   (Coeficiente de Determinação): {r2:.3f}")
    return {"mae": mae, "rmse": rmse, "r2": r2}


print("=" * 55)
print("COMPARAÇÃO ENTRE MODELOS (conjunto de teste)")
print("=" * 55)
metricas_linear = metrificar(y_test, pred_linear, "Regressão Linear")
metricas_rf = metrificar(y_test, pred_rf, "Random Forest Regressor")

if metricas_rf["rmse"] <= metricas_linear["rmse"]:
    melhor_nome = "Random Forest Regressor"
    y_pred = pred_rf
    melhor_metricas = metricas_rf
else:
    melhor_nome = "Regressão Linear"
    y_pred = pred_linear
    melhor_metricas = metricas_linear

print(f"\n>>> Melhor modelo (menor RMSE): {melhor_nome}")

erros = y_test.values - y_pred 

media_erro = np.mean(erros)
desvio_padrao_erro = np.std(erros, ddof=1)  

margem_95 = 1.96 * desvio_padrao_erro
intervalo_95 = (media_erro - margem_95, media_erro + margem_95)

print("\n" + "=" * 55)
print(f"ESTATÍSTICAS DOS ERROS - {melhor_nome}")
print("=" * 55)
print(f"Média dos erros:            {media_erro:.4f}")
print(f"Desvio padrão dos erros:    {desvio_padrao_erro:.4f}")
print(f"Intervalo de erro (95%):    [{intervalo_95[0]:.3f} ; {intervalo_95[1]:.3f}]")
print(f"MAE:                        {melhor_metricas['mae']:.4f}")
print(f"RMSE:                       {melhor_metricas['rmse']:.4f}")
print(f"R²:                         {melhor_metricas['r2']:.4f}")

resultados = pd.DataFrame({
    "nome_aluno": nomes_test.values,      
    "nota_real": y_test.values,
    "nota_prevista": np.round(y_pred, 2),
    "erro": np.round(erros, 2),
})
resultados["erro_absoluto"] = resultados["erro"].abs()
resultados = resultados.sort_values("erro_absoluto", ascending=False).reset_index(drop=True)

caminho_predicoes = PASTA_DADOS / "predicoes_teste.csv"
resultados.drop(columns="erro_absoluto").to_csv(caminho_predicoes, index=False)

print("\n" + "=" * 55)
print("AMOSTRA DE PREVISÕES POR ALUNO (conjunto de teste)")
print("=" * 55)
print(resultados.drop(columns="erro_absoluto").head(10).to_string(index=False))
print(f"\nTabela completa de previsões salva em: {caminho_predicoes}")

alunos_grupo = resultados[resultados["nome_aluno"].isin(["Alex Expedito", "Matheus Curci"])]
if not alunos_grupo.empty:
    print("\nPrevisão para os integrantes do grupo (estavam no conjunto de teste):")
    print(alunos_grupo.drop(columns="erro_absoluto").to_string(index=False))
else:
    print("\nOs integrantes do grupo ficaram no conjunto de treino nesta divisão (não aparecem no teste).")

caminho_resumo = PASTA_DADOS / "resumo_resultados.txt"
with open(caminho_resumo, "w", encoding="utf-8") as f:
    f.write("RESULTADOS DO EXPERIMENTO\n")
    f.write("=" * 40 + "\n\n")
    f.write("Regressão Linear:\n")
    f.write(f"  MAE:  {metricas_linear['mae']:.4f}\n")
    f.write(f"  RMSE: {metricas_linear['rmse']:.4f}\n")
    f.write(f"  R2:   {metricas_linear['r2']:.4f}\n\n")
    f.write("Random Forest Regressor:\n")
    f.write(f"  MAE:  {metricas_rf['mae']:.4f}\n")
    f.write(f"  RMSE: {metricas_rf['rmse']:.4f}\n")
    f.write(f"  R2:   {metricas_rf['r2']:.4f}\n\n")
    f.write(f"Melhor modelo: {melhor_nome}\n\n")
    f.write("Estatísticas dos erros (resíduos) do melhor modelo:\n")
    f.write(f"  Média do erro:         {media_erro:.4f}\n")
    f.write(f"  Desvio padrão do erro: {desvio_padrao_erro:.4f}\n")
    f.write(f"  Intervalo de erro 95%: [{intervalo_95[0]:.3f} ; {intervalo_95[1]:.3f}]\n")
    f.write("\nCoeficientes da Regressão Linear (peso de cada variável):\n")
    for nome_feat, coef in zip(features, modelo_linear.coef_):
        f.write(f"  {nome_feat}: {coef:.4f}\n")
    f.write(f"  intercepto: {modelo_linear.intercept_:.4f}\n")

plt.style.use("seaborn-v0_8-whitegrid")

plt.figure(figsize=(6, 6))
plt.scatter(y_test, y_pred, alpha=0.6, color="#4C72B0", edgecolor="white")
lim_min, lim_max = 0, 10
plt.plot([lim_min, lim_max], [lim_min, lim_max], "r--", label="Previsão perfeita")
plt.xlabel("Nota Final Real")
plt.ylabel("Nota Final Prevista")
plt.title(f"Real vs. Previsto - {melhor_nome}")
plt.legend()
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "1_real_vs_previsto.png", dpi=150)
plt.close()

plt.figure(figsize=(7, 5))
plt.hist(erros, bins=20, color="#55A868", edgecolor="black", alpha=0.8)
plt.axvline(media_erro, color="red", linestyle="--", label=f"Média = {media_erro:.2f}")
plt.axvline(media_erro + desvio_padrao_erro, color="orange", linestyle=":", label="+1 desvio padrão")
plt.axvline(media_erro - desvio_padrao_erro, color="orange", linestyle=":", label="-1 desvio padrão")
plt.xlabel("Erro (Nota Real - Nota Prevista)")
plt.ylabel("Frequência")
plt.title("Distribuição dos Erros de Previsão")
plt.legend()
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "2_distribuicao_erros.png", dpi=150)
plt.close()

plt.figure(figsize=(7, 5))
importancias = modelo_rf.feature_importances_
ordem = np.argsort(importancias)
plt.barh(np.array(features)[ordem], importancias[ordem], color="#C44E52")
plt.xlabel("Importância Relativa")
plt.title("Importância das Variáveis (Random Forest)")
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "3_importancia_variaveis.png", dpi=150)
plt.close()

plt.figure(figsize=(7, 5))
labels = ["MAE", "RMSE", "R²"]
valores_linear = [metricas_linear["mae"], metricas_linear["rmse"], metricas_linear["r2"]]
valores_rf = [metricas_rf["mae"], metricas_rf["rmse"], metricas_rf["r2"]]
x = np.arange(len(labels))
largura = 0.35
plt.bar(x - largura/2, valores_linear, largura, label="Regressão Linear", color="#4C72B0")
plt.bar(x + largura/2, valores_rf, largura, label="Random Forest", color="#DD8452")
plt.xticks(x, labels)
plt.title("Comparação de Métricas entre Modelos")
plt.legend()
plt.tight_layout()
plt.savefig(PASTA_GRAFICOS / "4_comparacao_modelos.png", dpi=150)
plt.close()

print(f"\nGráficos salvos em: {PASTA_GRAFICOS}")
print("Processo finalizado com sucesso.")