#!/usr/bin/env python3
"""
Gerador de dados FICTÍCIOS para a demonstração do painel.

Por que gerar em vez de anonimizar um dump real: anonimizar é uma peneira, e
sempre escapa alguma coisa — um e-mail num campo de texto livre, um telefone no
meio de uma observação, um CPF que ficou de fora da regra. Aqui nada vem de
lugar nenhum: cada número nasce de uma distribuição escrita neste arquivo.

Os valores são plausíveis para um lançamento digital (ordem de grandeza, formato
de funil, sazonalidade de fim de semana), mas não correspondem a nenhuma
campanha real, empresa real ou pessoa real.

Uso:
    python3 gerar_dados.py > dados.json
"""

import json
import random
from datetime import date, timedelta

# semente fixa: a demo precisa ser sempre igual, senão o print do portfólio
# não bate com o que a pessoa vê ao abrir o link
random.seed(20260811)

INICIO = date(2026, 3, 2)
DIAS = 28

# ---------------------------------------------------------------- páginas ----
# Cada página de destino tem um "temperamento" próprio: uma converte bem e atrai
# o público certo, outra é barata mas traz gente fora do perfil. É essa tensão
# que o painel precisa deixar visível — o caso interessante não é a página ruim
# em tudo, é a que parece boa num número e ruim no outro.
PAGINAS = [
    # slug,   peso,  conv,  %mql,  cpc
    ("nv1",   0.62,  0.42,  0.71,  6.05),  # carro-chefe: volume com qualidade
    ("nv2",   0.14,  0.38,  0.66,  6.42),
    ("tr8",   0.09,  0.35,  0.48,  5.20),  # CPL bom, mas atrai fora do perfil
    ("cx4",   0.07,  0.29,  0.63,  7.31),  # cara e mediana
    ("nv1-b", 0.05,  0.45,  0.74,  6.08),  # variante boa, pouco volume
    ("hq2",   0.03,  0.22,  0.39,  8.44),  # ruim nos dois eixos
]

# ------------------------------------------------------------- criativos ----
NOMES_CRIATIVO = [
    "VID_DEPOIMENTO_01", "VID_DEPOIMENTO_02", "IMG_CARROSSEL_DADOS",
    "VID_ANCORA_PROBLEMA", "IMG_ESTATICO_PROVA", "VID_BASTIDOR_03",
    "IMG_CARROSSEL_PASSO", "VID_ANCORA_DOR", "IMG_ESTATICO_OFERTA",
    "VID_DEPOIMENTO_04",
]


def curva_do_dia(i: int) -> float:
    """Investimento sobe ao longo da captação e cai no fim de semana."""
    d = INICIO + timedelta(days=i)
    rampa = 0.55 + (i / DIAS) * 0.95              # começa devagar, escala
    fds = 0.72 if d.weekday() >= 5 else 1.0        # sábado e domingo entregam menos
    return rampa * fds * random.uniform(0.92, 1.08)


def gerar():
    dias, paginas_dia = [], []

    for i in range(DIAS):
        d = INICIO + timedelta(days=i)
        fator = curva_do_dia(i)
        investimento_dia = round(6800 * fator, 2)

        leads_dia = 0
        mql_dia = 0

        for slug, peso, conv, pmql, cpc in PAGINAS:
            gasto = round(investimento_dia * peso * random.uniform(0.9, 1.1), 2)
            cliques = int(gasto / (cpc * random.uniform(0.94, 1.06)))
            page_views = int(cliques * random.uniform(0.83, 0.93))   # connect rate
            leads = int(page_views * conv * random.uniform(0.9, 1.1))
            mql = int(leads * pmql * random.uniform(0.94, 1.06))

            leads_dia += leads
            mql_dia += mql

            paginas_dia.append({
                "data": d.isoformat(), "pagina": slug, "gasto": gasto,
                "cliques": cliques, "page_views": page_views,
                "leads": leads, "mql": mql,
            })

        dias.append({
            "data": d.isoformat(),
            "investimento": investimento_dia,
            "leads": leads_dia,
            "mql": mql_dia,
        })

    # criativos: gasto e leads correlacionados, mas com dispersão real de CPL
    criativos = []
    for nome in NOMES_CRIATIVO:
        gasto = round(random.uniform(2400, 26000), 2)
        eficiencia = random.uniform(0.55, 1.65)        # o que separa bom de ruim
        leads = max(12, int(gasto / (17.2 / eficiencia)))
        criativos.append({
            "criativo": nome,
            "formato": "vídeo" if nome.startswith("VID") else "imagem",
            "gasto": gasto,
            "leads": leads,
            "mql": int(leads * random.uniform(0.42, 0.78)),
        })

    return {
        "aviso": "DADOS FICTÍCIOS — gerados por gerar_dados.py. Nenhum valor "
                 "corresponde a campanha, empresa ou pessoa real.",
        "periodo": {"de": INICIO.isoformat(),
                    "ate": (INICIO + timedelta(days=DIAS - 1)).isoformat()},
        "metas": {"cpl": 15.0, "conversao": 0.40, "mql": 0.60, "connect": 0.85},
        "dias": dias,
        "paginas_dia": paginas_dia,
        "criativos": criativos,
    }


if __name__ == "__main__":
    print(json.dumps(gerar(), ensure_ascii=False, indent=2))
