# Painel de captação de lançamento · demonstração

Este é o **front de produção de um painel de acompanhamento de lançamento digital**,
publicado rodando com **dados inteiramente fictícios**. Não é um protótipo nem uma
recriação: é o mesmo Vue compilado, com os mesmos componentes, tabelas, modais e
gráficos. O que muda é de onde vêm os números.

**[▶ Abrir a demonstração](https://victorhugo-alves.github.io/painel-captacao-case/demo/)**

> **Tudo aqui é fictício.** Nenhum número, nome, campanha, página, meta ou pessoa
> corresponde a algo real. A marca "Curso Nacional" e o símbolo foram criados para
> esta demonstração e não representam nenhuma organização existente.

---

## O que dá para ver

O painel acompanha uma captação de leads de 40 dias, e a demo abre sempre no meio
dela, com 26 dias corridos e 14 pela frente.

- **Indicadores:** investimento, funil de mídia (CPM, CTR, connect rate, conversão
  da página), leads, CPL e %MQL, dia a dia e acumulado, cada métrica contra a meta.
- **Ritmo e projeção:** quanto falta captar e investir por dia para bater a meta,
  com régua de *catch-up* (recalcula o necessário diário a cada dia) e projeção de
  fechamento a partir da média dos últimos dias fechados.
- **Páginas:** desempenho por página de captura, com escala de cor por distância da
  meta (mais sobre isso abaixo).
- **Criativos:** gasto, CTR, retenção de vídeo, leads e MQL por anúncio, com o
  status do gerenciador.
- **Grupo, pesquisa, caderno, mensageria e equipe:** as demais etapas do funil.

Os filtros de data no topo funcionam de verdade: recortam a série e tudo que deriva
dela, aba por aba.

## A decisão de leitura que o painel carrega

A versão anterior pintava cada métrica de **verde** quando batia a meta e de
**vermelho** quando não batia.

Parece razoável, até colocar duas páginas lado a lado. Uma convertendo **34%** e
outra **19%**, ambas contra uma meta de 40%, saíam **idênticas** na tela.

Não são a mesma situação. A primeira está a seis pontos do alvo e provavelmente se
resolve com ajuste de público. A segunda está a menos da metade, e aí o problema é
outro: oferta, promessa, ou público completamente errado. Quem opera o painel
durante o lançamento precisa saber **o que atacar primeiro**, e duas cores não
priorizam nada.

A troca foi por **cinco faixas**, calculadas pela razão entre o valor e a meta:

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
fonte, e cada célula colorida tem `title` dizendo em texto a distância da meta, já
que cor sozinha não comunica para quem não a enxerga.

## Como a demo roda sem back-end

O painel de produção fala com uma API Fastify sobre Postgres. Aqui não existe
servidor, e mesmo assim nenhum componente foi alterado. São três peças, todas em
[`fonte-demo/`](fonte-demo/):

**[`intercept.js`](fonte-demo/intercept.js)** substitui `window.fetch` e responde as
chamadas `/api/*`. Como todas as camadas de dados do front passam pelo mesmo `fetch`,
elas ficaram intactas, inclusive os parâmetros `from`, `to` e `utm`, que são
repassados aos geradores. É por isso que os filtros de data funcionam.

**[`fixtures.js`](fonte-demo/fixtures.js)** gera os dados das 35 rotas. Uma série
diária é a fonte única: investimento, impressões, cliques, page views e leads saem de
distribuições escritas no arquivo, e páginas, criativos, campanhas, grupo, pesquisa e
mensageria são derivados dela. Por isso os números **fecham entre as abas**: o total
de leads da aba Páginas bate com o dos Indicadores porque é o mesmo número, dividido
de outro jeito.

**[`supabase-duble.js`](fonte-demo/supabase-duble.js)** é um dublê do cliente de
autenticação, com a mesma superfície de exports. Foi a peça necessária para que a URL
do banco e a chave anônima não entrassem no bundle publicado.

### Por que gerar em vez de anonimizar

Anonimizar um recorte real é uma peneira: sempre escapa um e-mail num campo de texto
livre, um telefone no meio de uma observação, um documento que ficou fora da regra.
Gerando do zero **não existe origem**, não há registro real por trás de nenhuma linha.

O mesmo raciocínio vale para as **metas**, que também são inventadas
([`config.js`](fonte-demo/config.js)). Alvo de operação é informação de negócio, e
não há motivo para publicá-lo só porque o painel o exibe.

Uma escolha de calibragem: os números foram ajustados para o lançamento fictício
ficar **levemente atrás do ritmo**, com o CPL do gerenciador acima da meta e o do
Active abaixo. Um painel onde está tudo verde não mostra para que ele serve.

## Stack

Vue 3 + Vite no front. Em produção, Fastify + Postgres por trás, com ingestão
automática de várias fontes de mídia e mensageria. A demo publicada é o mesmo build
do front, servido estaticamente pelo GitHub Pages.
