// =====================================================================
// DADOS FICTÍCIOS da demonstração pública.
//
// Nada aqui vem de banco, export ou anonimização: cada número nasce das
// distribuições escritas neste arquivo. Anonimizar um recorte real é uma
// peneira — sempre escapa um e-mail num campo livre ou um telefone numa
// observação. Gerando do zero não existe origem.
//
// Determinístico de propósito (PRNG com semente fixa): a demo precisa ser
// sempre igual, senão o texto do case não bate com o que a tela mostra.
// =====================================================================

// PRNG mulberry32 — pequeno, determinístico, sem dependência.
function prng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = prng(20260811)
const entre = (a, b) => a + rnd() * (b - a)
const int = (a, b) => Math.round(entre(a, b))

const INICIO = new Date(Date.UTC(2026, 2, 2)) // 02/03/2026
const DIAS = 28
const dia = (i) => new Date(INICIO.getTime() + i * 86400000).toISOString().slice(0, 10)

// Páginas com "temperamento" próprio: uma converte bem e traz o público certo,
// outra é barata mas atrai gente fora do perfil. É essa tensão que o painel
// precisa deixar visível.
const PAGINAS = [
  { slug: 'nv1',   peso: 0.62, conv: 0.42, mql: 0.71, cpc: 6.05 },
  { slug: 'nv2',   peso: 0.14, conv: 0.38, mql: 0.66, cpc: 6.42 },
  { slug: 'tr8',   peso: 0.09, conv: 0.35, mql: 0.48, cpc: 5.20 },
  { slug: 'cx4',   peso: 0.07, conv: 0.29, mql: 0.63, cpc: 7.31 },
  { slug: 'nv1-b', peso: 0.05, conv: 0.45, mql: 0.74, cpc: 6.08 },
  { slug: 'hq2',   peso: 0.03, conv: 0.22, mql: 0.39, cpc: 8.44 },
]
const BASE_URL = 'https://cursonacional.exemplo.br/'

// investimento sobe ao longo da captação e cai no fim de semana
function fator(i) {
  const d = new Date(INICIO.getTime() + i * 86400000)
  const fds = d.getUTCDay() === 0 || d.getUTCDay() === 6 ? 0.72 : 1
  return (0.55 + (i / DIAS) * 0.95) * fds * entre(0.92, 1.08)
}

// ---------------------------------------------------------------- núcleo ----
const DIAS_DADOS = []
const PAG_DIA = []
for (let i = 0; i < DIAS; i++) {
  const f = fator(i)
  const invest = +(6800 * f).toFixed(2)
  let leads = 0, mql = 0, pv = 0, cliques = 0, impressoes = 0

  for (const p of PAGINAS) {
    const gasto = +(invest * p.peso * entre(0.9, 1.1)).toFixed(2)
    const cl = Math.round(gasto / (p.cpc * entre(0.94, 1.06)))
    const v = Math.round(cl * entre(0.83, 0.93))
    const l = Math.round(v * p.conv * entre(0.9, 1.1))
    const m = Math.round(l * p.mql * entre(0.94, 1.06))
    const imp = Math.round(cl * entre(38, 62))
    leads += l; mql += m; pv += v; cliques += cl; impressoes += imp
    PAG_DIA.push({
      id: PAG_DIA.length + 1, evento_id: 'demo', data: dia(i), url: BASE_URL + p.slug,
      gasto, impressoes: imp, cliques: cl, page_views: v, leads: l,
      atualizado_em: dia(i) + 'T12:00:00Z', _mql: m,
    })
  }

  const disparos = +(invest * entre(0.03, 0.06)).toFixed(2)
  DIAS_DADOS.push({
    date: dia(i),
    investTrafego: invest, investCaptacao: +(invest * 0.94).toFixed(2),
    investRemarketing: 0, investAquecimento: 0, investLembretes: 0,
    investDistribuicao: 0, investDisparos: disparos,
    investFacebook: +(invest * 0.86).toFixed(2), investGoogle: +(invest * 0.14).toFixed(2),
    investTrafegoFb: +(invest * 0.86).toFixed(2),
    impressoes, alcance: Math.round(impressoes / entre(1.9, 2.4)),
    clicksFb: cliques, pageviews: pv,
    leads, leadsActive: leads, mql,
    grupo: Math.round(leads * entre(0.86, 0.93)),
    pesquisas: Math.round(leads * entre(0.55, 0.68)),
  })
}

const T = DIAS_DADOS.reduce((a, d) => ({
  invest: a.invest + d.investTrafego, leads: a.leads + d.leads, mql: a.mql + d.mql,
  pv: a.pv + d.pageviews, cl: a.cl + d.clicksFb, grupo: a.grupo + d.grupo,
  pesq: a.pesq + d.pesquisas, imp: a.imp + d.impressoes,
}), { invest: 0, leads: 0, mql: 0, pv: 0, cl: 0, grupo: 0, pesq: 0, imp: 0 })

// ------------------------------------------------------------- criativos ----
const NOMES = ['VID_DEPOIMENTO_01', 'VID_DEPOIMENTO_02', 'IMG_CARROSSEL_DADOS',
  'VID_ANCORA_PROBLEMA', 'IMG_ESTATICO_PROVA', 'VID_BASTIDOR_03', 'IMG_CARROSSEL_PASSO',
  'VID_ANCORA_DOR', 'IMG_ESTATICO_OFERTA', 'VID_DEPOIMENTO_04']
const CRIATIVOS = NOMES.map((n, i) => {
  const gasto = +entre(2400, 26000).toFixed(2)
  const efic = entre(0.55, 1.65)
  const leads = Math.max(12, Math.round(gasto / (17.2 / efic)))
  const cliques = Math.round(gasto / entre(5.2, 8.4))
  return {
    ad_id: '9' + (100000 + i * 137), ad_name: n,
    campanha: 'CAPTACAO | ' + (i % 2 ? 'LAL 3%' : 'INTERESSES'),
    campaign_id: 'c' + (7000 + i), adset_id: 'a' + (8000 + i),
    adset_name: i % 2 ? 'LAL 3% compradores' : 'Interesse | Direito',
    gasto, impressoes: Math.round(cliques * entre(38, 62)), cliques, leads,
    plays_3s: n.startsWith('VID') ? Math.round(cliques * entre(2.2, 3.4)) : 0,
    p75: n.startsWith('VID') ? Math.round(cliques * entre(0.6, 1.1)) : 0,
    thruplay: n.startsWith('VID') ? Math.round(cliques * entre(0.4, 0.8)) : 0,
    leadsActive: leads, mql: Math.round(leads * entre(0.42, 0.78)),
    status: i < 6 ? 'ACTIVE' : 'PAUSED',
    thumb_url: '', instagram_url: '', veiculado_em: dia(Math.max(0, 26 - i * 2)),
  }
})

// --------------------------------------------------------------- páginas ----
const porPagina = {}
for (const r of PAG_DIA) {
  const a = (porPagina[r.url] ??= { leads: 0, mql: 0 })
  a.leads += r.leads; a.mql += r._mql
}
const TOTAL_MQL_PAG = Object.values(porPagina).reduce((s, x) => s + x.mql, 0)

// ------------------------------------------------------------- pesquisa ----
// dos leads, uma parte responde; entre quem responde, a área declarada divide
// em advocacia / contabilidade / outra.
const RESP = Math.round(T.leads * 0.63)
const RESP_ADV = Math.round(RESP * 0.427)
const RESP_CONT = Math.round(RESP * 0.277)
const RESP_OUTRO = RESP - RESP_ADV - RESP_CONT

const QUAL_DIAS = DIAS_DADOS.map((d, i) => {
  const t = d.pesquisas
  const adv = Math.round(t * entre(0.40, 0.46))
  const cont = Math.round(t * entre(0.25, 0.31))
  return { dia: d.date, total: t, advogado: adv, contador: cont, outro: t - adv - cont, acumulado: 0 }
})
QUAL_DIAS.reduce((acc, d) => (d.acumulado = acc + d.total), 0)

// =====================================================================
// Mapa rota -> resposta. Rota não listada devolve estrutura vazia segura;
// o front já é defensivo (todo *-api.js tem fallback), então a tela
// renderiza sem os blocos que dependeriam dela.
// =====================================================================
export const FIXTURES = {
  '/indicadores': { dias: DIAS_DADOS },

  '/leads/active': DIAS_DADOS.flatMap((d) => {
    const adv = Math.round(d.mql * 0.62), cont = d.mql - adv
    return [
      { data: d.date, segmento: 'advogado', leads: adv },
      { data: d.date, segmento: 'contador', leads: cont },
      { data: d.date, segmento: 'outro', leads: d.leads - d.mql },
    ]
  }),

  '/paginas': PAG_DIA.map(({ _mql, ...r }) => r),

  '/paginas/active': {
    total: T.leads,
    advogado: Math.round(TOTAL_MQL_PAG * 0.62),
    contador: TOTAL_MQL_PAG - Math.round(TOTAL_MQL_PAG * 0.62),
    mql: TOTAL_MQL_PAG,
    paginas: Object.entries(porPagina).map(([origem, a]) => ({
      origem, leads: a.leads,
      advogado: Math.round(a.mql * 0.62),
      contador: a.mql - Math.round(a.mql * 0.62),
      mql: a.mql,
    })),
  },

  '/criativos/lista': CRIATIVOS,
  '/criativos': CRIATIVOS,

  '/qualificacao/resumo': {
    total: RESP, brutas: RESP, leads: RESP, taxa: 1,
    taxa_ac: RESP / T.leads, taxa_ac_madura: (RESP / T.leads) * 0.96,
    base_ac: T.leads, base_madura: Math.round(T.leads * 0.84), respostas_ac: RESP,
    periodo: null, saudaveis: Math.round(RESP * 0.99), pct_saudavel: 0.99,
    distribuicao: {
      area: { Advocacia: RESP_ADV, Contabilidade: RESP_CONT, Outra: RESP_OUTRO },
      faturamento: {
        'Até R$ 5 mil': Math.round(RESP * 0.47), 'R$ 5 a 15 mil': Math.round(RESP * 0.33),
        'R$ 15 a 30 mil': Math.round(RESP * 0.11), 'Acima de R$ 30 mil': Math.round(RESP * 0.09),
      },
    },
    mql: RESP_ADV + RESP_CONT, mql_advogado: RESP_ADV, mql_contador: RESP_CONT,
    mql_outro: RESP_OUTRO, pct_mql: (RESP_ADV + RESP_CONT) / RESP,
    pct_mql_advogado: RESP_ADV / RESP, pct_mql_contador: RESP_CONT / RESP,
  },

  '/qualificacao/diario': { dias: QUAL_DIAS, total: RESP },
  '/qualificacao/taxa-diaria': {
    dias: DIAS_DADOS.map((d, i) => {
      const base = DIAS_DADOS.slice(0, i + 1).reduce((s, x) => s + x.leads, 0)
      const resp = DIAS_DADOS.slice(0, i + 1).reduce((s, x) => s + x.pesquisas, 0)
      return { dia: d.date, base, respostas: resp, taxa: resp / base }
    }),
  },
  '/qualificacao/geral': { leads: RESP, perfis: RESP, respostas: RESP, progresso: [] },
  '/qualificacao/alunos': [],

  '/grupos/ingresso-taxa': {
    total: {
      ingressos: T.grupo, leads: T.leads, ingressos_lead: T.grupo,
      sem_lead: 0, no_grupo_lead: T.grupo, taxa_ingresso: T.grupo / T.leads,
    },
    segmentos: [
      { segmento: 'advogado', ingressos: Math.round(T.grupo * 0.44), no_grupo: Math.round(T.grupo * 0.44), leads: Math.round(T.leads * 0.43), ingressos_lead: Math.round(T.grupo * 0.44), sem_lead: 0, no_grupo_lead: Math.round(T.grupo * 0.44), taxa_ingresso: 0.9 },
      { segmento: 'contador', ingressos: Math.round(T.grupo * 0.28), no_grupo: Math.round(T.grupo * 0.28), leads: Math.round(T.leads * 0.28), ingressos_lead: Math.round(T.grupo * 0.28), sem_lead: 0, no_grupo_lead: Math.round(T.grupo * 0.28), taxa_ingresso: 0.89 },
      { segmento: 'outro', ingressos: Math.round(T.grupo * 0.28), no_grupo: Math.round(T.grupo * 0.28), leads: Math.round(T.leads * 0.29), ingressos_lead: Math.round(T.grupo * 0.28), sem_lead: 0, no_grupo_lead: Math.round(T.grupo * 0.28), taxa_ingresso: 0.87 },
    ],
  },
  '/grupos/ingresso': { total: T.grupo, dias: DIAS_DADOS.map((d) => ({ dia: d.date, ingressos: d.grupo })) },
  '/grupos/resumo': { no_grupo: T.grupo, taxa_evasao: 0.038 },
  '/grupos/membros': [],
  '/grupos/alertas': [],

  '/workbook/resumo': {
    estado: 'ativo',
    pesquisas_respondidas: RESP, pesquisas_completas: Math.round(RESP * 0.93),
    contas_criadas: Math.round(RESP * 0.61), ja_acessaram: Math.round(RESP * 0.52),
    logaram_de_novo: Math.round(RESP * 0.21), usaram_anotacoes: Math.round(RESP * 0.13),
    nunca_acessaram: Math.round(RESP * 0.09), taxa_acesso: 0.85,
    acessos_24h: int(120, 260), acessos_7d: int(900, 1500),
    abriram_apostila: Math.round(RESP * 0.44), preencheram: Math.round(RESP * 0.19),
    ativos_7d: Math.round(RESP * 0.27),
  },

  '/disparos/resumo': [
    { canal: 'whatsapp', base: T.leads, entregues: Math.round(T.leads * 0.96), recebidos: Math.round(T.leads * 0.94), cliques: Math.round(T.leads * 0.31) },
    { canal: 'email', base: T.leads, entregues: Math.round(T.leads * 0.91), recebidos: Math.round(T.leads * 0.4), cliques: Math.round(T.leads * 0.08) },
    { canal: 'sms', base: Math.round(T.leads * 0.5), entregues: Math.round(T.leads * 0.47), recebidos: Math.round(T.leads * 0.46), cliques: Math.round(T.leads * 0.05) },
  ],
}

// resposta padrão para rota não mapeada: nada que quebre o front
export function respostaPadrao(path) {
  return path.includes('/lista') || path.endsWith('s') ? [] : {}
}
