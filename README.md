# Painel de captação · estudo de caso

Reprodução de um painel de acompanhamento de lançamento digital, com **dados
inteiramente fictícios**. O objetivo não é mostrar código de dashboard: é mostrar
como uma decisão de leitura de dado muda o que a pessoa faz com a verba.

**[▶ Ver a demonstração](#)** *(link do GitHub Pages depois de publicar)*

---

## O problema

A versão anterior do painel pintava cada métrica de **verde** quando batia a meta e
de **vermelho** quando não batia.

Parece razoável, até você colocar duas páginas lado a lado. Uma convertendo **34,2%**
e outra **19,3%**, ambas contra uma meta de 40%, saíam **idênticas** na tela.

Não são a mesma situação. A primeira está a seis pontos do alvo e provavelmente se
resolve com ajuste de público. A segunda está a menos da metade, e aí o problema é
outro: oferta, promessa, ou público completamente errado.

Quem opera o painel durante o lançamento precisa saber **o que atacar primeiro**.
Duas cores não priorizam nada.

## A decisão

Trocar o binário por **cinco faixas**, calculadas pela razão entre o valor e a meta:

| Faixa | Situação |
| --- | --- |
| ≥ 110% da meta | superou com folga |
| 100% a 110% | na meta |
| 85% a 100% | quase lá |
| 65% a 85% | atenção |
| < 65% | crítico |

Em métricas onde **menor é melhor** (CPL), a razão inverte. É a mesma função para
todas as colunas, então nenhuma métrica precisa de regra própria:

```js
function nivel(valor, meta, maiorMelhor = true) {
  if (valor == null || !meta) return ''
  const r = maiorMelhor ? valor / meta : meta / valor
  if (!isFinite(r)) return ''
  if (r >= 1.10) return 's5'
  if (r >= 1.00) return 's4'
  if (r >= 0.85) return 's3'
  if (r >= 0.65) return 's2'
  return 's1'
}
```

Duas escolhas de acessibilidade acompanham: as pontas da escala ganham peso maior na
fonte, e cada célula colorida tem `title` dizendo em texto a distância da meta — cor
sozinha não comunica para quem não a enxerga.

## O que a tabela passou a mostrar

- **A página barata que sai cara.** `tr8` tem o segundo melhor CPL do estudo
  (R$ 17,34) e passaria por saudável em qualquer relatório de custo. Mas **53% dos
  leads dela estão fora do perfil**. Compra barato o público errado, e escalá-la
  derruba a qualidade do funil inteiro.
- **A variante que merecia verba.** `nv1-b` tem o melhor CPL, a melhor conversão e o
  melhor MQL, com apenas 5% do investimento.
- **A que precisa parar hoje.** `hq2` é vermelho em tudo: CPL de R$ 52,58, três vezes
  a meta, e 23% de MQL.

Nenhuma dessas conclusões exige análise adicional. Elas ficam visíveis na própria
tabela, que é o ponto: o painel é **operado** por quem decide verba durante o
lançamento, não lido com calma depois.

## Os dados

Todo número vem de [`gerar_dados.py`](gerar_dados.py), que sorteia valores a partir de
distribuições escritas no próprio arquivo: uma curva de investimento que sobe ao longo
da captação e cai no fim de semana, e um "temperamento" por página, com taxa de
conversão e proporção de público-alvo próprias.

```bash
python3 gerar_dados.py > dados.json
```

A semente é fixa, então a demonstração é sempre idêntica e o texto acima corresponde
exatamente ao que a tabela mostra.

### Por que gerar em vez de anonimizar

Anonimizar um recorte real é uma peneira: sempre escapa um e-mail num campo de texto
livre, um telefone no meio de uma observação, um documento que ficou fora da regra.
Gerando do zero **não existe origem** — não há registro real por trás de nenhuma linha.

> **Dados fictícios.** Nenhum valor deste repositório corresponde a campanha, empresa,
> produto ou pessoa real. A marca "Curso Nacional" e o símbolo foram criados para esta
> demonstração e não representam nenhuma organização existente.

## Stack

A versão de produção deste painel roda em **Vue 3 + Fastify + Postgres**, com ingestão
automática de várias fontes de mídia e mensageria. Esta demonstração é uma reprodução
estática da mesma interface, sem back-end, para poder ser publicada e navegada.
