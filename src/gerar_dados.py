import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)

DIRETORIO_BASE = Path(__file__).resolve().parent if "__file__" in locals() else Path.cwd()
PASTA_DADOS = DIRETORIO_BASE / "dados"
PASTA_DADOS.mkdir(parents=True, exist_ok=True)

N_ALUNOS = 400

NOMES = [
    "Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Felipe", "Gabriela", "Hugo",
    "Isabela", "João", "Karina", "Lucas", "Mariana", "Nicolas", "Otávio",
    "Patrícia", "Rafael", "Sabrina", "Thiago", "Vanessa", "William", "Yasmin",
    "Camila", "Diego", "Elaine", "Fernando", "Giovana", "Henrique", "Ingrid",
    "Juliana", "Kevin", "Larissa", "Marcelo", "Natália", "Paulo", "Renata",
    "Sérgio", "Tatiane", "Vinícius", "Wesley",
]
SOBRENOMES = [
    "Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Almeida",
    "Ribeiro", "Carvalho", "Gomes", "Martins", "Araújo", "Melo", "Barbosa",
    "Rocha", "Dias", "Nascimento", "Moreira", "Cardoso", "Teixeira",
]

nomes_alunos = [
    f"{np.random.choice(NOMES)} {np.random.choice(SOBRENOMES)}"
    for _ in range(N_ALUNOS)
]

vistos = {}
nomes_unicos = []
for nome in nomes_alunos:
    if nome not in vistos:
        vistos[nome] = 0
        nomes_unicos.append(nome)
    else:
        vistos[nome] += 1
        nomes_unicos.append(f"{nome} {vistos[nome] + 1}")

nomes_unicos[0] = "Alex Expedito"
nomes_unicos[1] = "Matheus Curci"

horas_estudo_semana = np.random.uniform(0, 20, N_ALUNOS)
frequencia_pct = np.random.uniform(50, 100, N_ALUNOS)
atividades_entregues = np.random.randint(0, 11, N_ALUNOS) 
nota_anterior = np.clip(np.random.normal(6.5, 1.8, N_ALUNOS), 0, 10)

ruido = np.random.normal(0, 0.6, N_ALUNOS)

nota_final = (
    0.10 * horas_estudo_semana        
    + 0.02 * frequencia_pct           
    + 0.25 * atividades_entregues     
    + 0.45 * nota_anterior       
    - 1.5                             
    + ruido
)
nota_final = np.clip(nota_final, 0, 10).round(2)

df = pd.DataFrame({
    "aluno_id": [f"A{i+1:04d}" for i in range(N_ALUNOS)],
    "nome_aluno": nomes_unicos,
    "horas_estudo_semana": horas_estudo_semana.round(1),
    "frequencia_pct": frequencia_pct.round(1),
    "atividades_entregues": atividades_entregues,
    "nota_anterior": nota_anterior.round(2),
    "nota_final": nota_final,
})

saida = PASTA_DADOS / "alunos.csv"
df.to_csv(saida, index=False)

print(f"Base gerada com {len(df)} alunos.")
print(df.head())
print("\nEstatísticas descritivas:")
print(df.describe())
print(f"\nArquivo salvo em: {saida}")