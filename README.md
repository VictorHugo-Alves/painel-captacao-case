# Central de controle de lançamento · demonstração

Demonstração pública de um sistema **em produção**: a camada de dados de um
lançamento digital inteiro, da ingestão bruta até a tela que a equipe abre de
manhã.

**[▶ Abrir a demonstração](https://victorhugo-alves.github.io/painel-captacao-case/demo/)** ·
**[Ler o caso completo](https://victorhugo-alves.github.io/casos/painel-captacao.html)**

O sistema roda sobre **R$ 500 mil em verba de tráfego e disparos** e é a fonte que
**sete frentes** da equipe consultam para decidir o dia seguinte: gestão de projeto,
tráfego, design web, design, edição de vídeo, liderança e direção.

Construí de ponta a ponta: autenticação e renovação de token de cada plataforma,
ingestão, normalização, reconciliação entre fontes que contam a mesma coisa de
jeitos diferentes, definição de cada métrica e de cada meta, e a operação diária em
cima disso.

> **A demonstração usa dados gerados do zero.** Nenhum número, nome, campanha,
> página ou meta corresponde a algo real. A marca "Curso Nacional" e o símbolo foram
> criados para esta demonstração e não representam nenhuma organização existente.
> Na versão oficial, tudo que aparece aqui tem dado real e funcional por trás.

---

## O que está integrado

| Fonte | O que entra |
| --- | --- |
| Meta Ads | investimento, impressões, cliques, criativo por criativo, retenção de vídeo, status do gerenciador |
| Google Ads | investimento e resultado por campanha e por anúncio |
| ActiveCampaign | base de leads, segmento, origem de UTM, envio e leitura de e-mail |
| SendFlow | entrada e saída do grupo de WhatsApp, por dia e por pessoa |
| Unnichat | mensageria de onboarding e custo por mensagem |
| ClickUp | execução da equipe durante o lançamento |

Banco em Postgres no Supabase, API em Fastify, painel em Vue 3. Ingestão automática:
ninguém cola planilha em lugar nenhum.

A parte que dá trabalho não é a tela, é a **reconciliação**. O gerenciador de
anúncios conta lead de um jeito, a ferramenta de e-mail conta de outro, e o grupo de
WhatsApp tem duas fontes que se sobrepõem. Definir qual número é o número, e por
quê, é o que sustenta todo o resto. É por isso que o painel mostra CPL do
gerenciador e CPL do Active lado a lado em vez de escolher um e esconder a
diferença.

## Como esta demonstração roda sem back-end

Não é um protótipo nem uma recriação: é o **mesmo front de produção compilado**,
mesmos componentes, mesmas contas. O que muda é de onde vêm os números. São três
peças, todas em [`fonte-demo/`](fonte-demo/), e nenhum componente do painel foi
alterado:

**[`intercept.js`](fonte-demo/intercept.js)** substitui `window.fetch` e responde as
chamadas `/api/*`. Como todas as camadas de dados passam pelo mesmo `fetch`, elas
ficaram intactas, inclusive os parâmetros `from`, `to` e `utm`, que são repassados
aos geradores. É por isso que os filtros de data funcionam de verdade.

**[`fixtures.js`](fonte-demo/fixtures.js)** gera os dados das 35 rotas. Uma série
diária é a fonte única, e páginas, criativos, campanhas, grupo, pesquisa e
mensageria derivam dela, então os números **fecham entre as abas**: o total de leads
da aba Páginas bate com o dos Indicadores porque é o mesmo número, dividido de outro
jeito.

**[`supabase-duble.js`](fonte-demo/supabase-duble.js)** é um dublê do cliente de
autenticação, com a mesma superfície de exports, para que a URL do banco e a chave
anônima não entrem no bundle publicado.

### Por que gerar em vez de anonimizar

Anonimizar um recorte real é uma peneira: sempre escapa um e-mail num campo de texto
livre, um telefone no meio de uma observação, um documento que ficou fora da regra.
Gerando do zero **não existe origem**, não há registro real por trás de nenhuma
linha. O mesmo vale para as **metas**, também inventadas
([`config.js`](fonte-demo/config.js)): alvo de operação é informação de negócio.

Os números foram calibrados para o lançamento fictício ficar levemente atrás do
ritmo, com o CPL do gerenciador acima da meta e o do Active abaixo. Um painel onde
está tudo verde não mostra para que ele serve.

## Autoria

A arquitetura, as integrações, as regras de métrica, as metas e a operação são
minhas. O código foi gerado com IA sob minha especificação, revisão e validação.

---

**Victor Hugo** · Analista de dados ·
[portfólio](https://victorhugo-alves.github.io/) ·
[GitHub](https://github.com/VictorHugo-Alves)
