// =====================================================================
// Dados fictícios da demonstração.
//
// Nada aqui vem de export, recorte ou anonimização de base real. Tudo é
// GERADO a partir de distribuições escritas neste arquivo, com um PRNG de
// semente fixa. A diferença importa: anonimizar é uma peneira, sempre
// escapa um e-mail num campo livre, um telefone dentro de uma observação.
// Gerando do zero não existe origem, então não há o que escapar.
//
// A série diária é a fonte única: páginas, criativos, campanhas, grupo,
// pesquisa e mensageria são todos derivados dela. Por isso os números
// fecham entre as abas: o total de leads da aba Páginas bate com o dos
// Indicadores porque é o mesmo número, dividido de outro jeito.
// =====================================================================
import {
  INICIO, HOJE_ISO, FIM_TESTES, EVENTO, METAS, SEGMENTOS, diasComDado, diffDias,
} from './config.js'

// ---------------------------------------------------------------- PRNG
// mulberry32: determinístico e sem dependência.
function prng(semente) {
  let a = semente >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
/** PRNG estável por chave: a mesma chave devolve sempre a mesma sequência. */
function rngDe(chave) {
  let h = 2166136261
  for (let i = 0; i < chave.length; i++) h = Math.imul(h ^ chave.charCodeAt(i), 16777619)
  return prng(h)
}
const entre = (r, min, max) => min + r() * (max - min)
const inteiro = (r, min, max) => Math.round(entre(r, min, max))
const escolhe = (r, lista) => lista[Math.floor(r() * lista.length)]
const arred = (v, c = 2) => Math.round(v * 10 ** c) / 10 ** c
const parteDe = (seg) => (seg === 'advogado' ? 0.34 : seg === 'contador' ? 0.22 : 0.44)

// memoiza cada gerador: a aba pode ser reaberta várias vezes sem recalcular
function umaVez(fn) {
  let v, feito = false
  return () => (feito ? v : ((v = fn()), (feito = true), v))
}

// ------------------------------------------------------------- páginas
// Cada página tem "temperamento" próprio: converte mais ou menos, atrai
// mais ou menos o público-alvo, e custa mais ou menos por clique. É o que
// faz a tabela de páginas ter algo a mostrar em vez de seis linhas iguais.
const PAGINAS = [
  { slug: 'nv1',   peso: 0.34, conv: 0.44, mql: 0.68, connect: 0.84, cpcMult: 0.94 },
  { slug: 'nv1-b', peso: 0.18, conv: 0.47, mql: 0.72, connect: 0.86, cpcMult: 0.90 },
  { slug: 'nv2',   peso: 0.17, conv: 0.40, mql: 0.61, connect: 0.81, cpcMult: 1.00 },
  { slug: 'tr8',   peso: 0.14, conv: 0.38, mql: 0.44, connect: 0.79, cpcMult: 0.88 },
  { slug: 'cx4',   peso: 0.10, conv: 0.33, mql: 0.58, connect: 0.75, cpcMult: 1.12 },
  { slug: 'hq2',   peso: 0.07, conv: 0.24, mql: 0.35, connect: 0.68, cpcMult: 1.34 },
]
const urlPagina = (slug) => `https://cursonacional.exemplo.br/${slug}`

// ------------------------------------------------------------ série diária
// Curva de investimento: 5 dias de teste com verba baixa, depois escala
// linear. Fim de semana rende menos (menos leilão, menos gente na tela).
export const serie = umaVez(() => {
  const r = prng(20260811)
  const dias = diasComDado()
  const iFimTestes = diffDias(INICIO, FIM_TESTES)

  return dias.map((date, i) => {
    const fds = [0, 6].includes(new Date(date + 'T12:00:00').getDay())
    const base = i <= iFimTestes ? entre(r, 1900, 2600) : 4900 + (i - iFimTestes) * 235
    const captacao = base * (fds ? 0.83 : 1) * entre(r, 0.9, 1.1)

    const capFb = captacao * entre(r, 0.78, 0.84)
    const capGg = captacao - capFb

    // fases que só ligam depois: remarketing a partir do dia 10, aquecimento
    // do 14, lembretes só na reta final (perto do evento).
    const rmkFb = i >= 10 ? captacao * entre(r, 0.10, 0.16) : 0
    const aqcFb = i >= 14 ? captacao * entre(r, 0.06, 0.11) : 0
    const lembretes = diffDias(date, EVENTO) <= 6 ? captacao * entre(r, 0.04, 0.08) : 0
    const distrib = i >= 12 ? captacao * entre(r, 0.02, 0.05) : 0
    const disparos = i >= 8 ? entre(r, 90, 340) : 0

    // funil do Meta. O CPL sai de cpm ÷ (1000·ctr·connect·conv). Os quatro
    // são sorteados, então o CPL do dia é consequência, não um número solto.
    const cpm = entre(r, 39, 48)
    const ctr = entre(r, 0.0108, 0.0143)
    const connect = entre(r, 0.75, 0.84)
    const conv = entre(r, 0.35, 0.43)

    const impressoes = Math.round((capFb / cpm) * 1000)
    const clicksFb = Math.round(impressoes * ctr)
    const pageviews = Math.round(clicksFb * connect)
    const leadsFb = Math.round(pageviews * conv)

    // Google: CPL um pouco melhor, volume bem menor
    const clicksGg = Math.round(capGg / entre(r, 2.4, 3.4))
    const leadsGg = Math.round(capGg / entre(r, 9.5, 13))

    // `leads` = gerenciador, que só enxerga o Meta, que é o que a ingestão traz.
    // O Active soma Google e orgânico, então fica bem acima. Essa diferença é
    // real e aparece no painel como CPL (gerenciador) ≠ CPL (Active).
    const leadsActive = Math.round((leadsFb + leadsGg) * entre(r, 1.03, 1.09))
    const activeFb = Math.round(leadsActive * entre(r, 0.75, 0.8))
    const activeGg = Math.round(leadsActive * entre(r, 0.12, 0.17))

    return {
      date,
      investTrafego: arred(captacao + rmkFb + aqcFb),
      investCaptacao: arred(captacao),
      investRemarketing: arred(rmkFb),
      investAquecimento: arred(aqcFb),
      investLembretes: arred(lembretes),
      investDistribuicao: arred(distrib),
      investDisparos: arred(disparos),
      investFacebook: arred(capFb + rmkFb + aqcFb),
      investGoogle: arred(capGg),
      investTrafegoFb: arred(capFb + rmkFb + aqcFb),
      investTrafegoGg: arred(capGg),
      investCaptacaoFb: arred(capFb),
      investCaptacaoGg: arred(capGg),
      investRemarketingFb: arred(rmkFb),
      investRemarketingGg: 0,
      investAquecimentoFb: arred(aqcFb),
      investAquecimentoGg: 0,
      // funil
      impressoes,
      alcance: Math.round(impressoes / entre(r, 1.6, 2.5)),
      clicks: clicksFb + clicksGg,
      clicksFb,
      clicksGg,
      pageviews,
      leads: leadsFb,   // gerenciador = só Meta
      leadsGgGer: leadsGg,
      leadsActive,
      activeFb,
      activeGg,
      grupo: Math.round(leadsActive * entre(r, 0.66, 0.76)),
      pesquisas: Math.round(leadsActive * entre(r, 0.40, 0.49)),
    }
  })
})

/** Recorta a série pelo filtro de data da barra superior. */
function recorte(from, to) {
  return serie().filter((d) => (!from || d.date >= from) && (!to || d.date <= to))
}

// ------------------------------------------------------------- pessoas
// Pools para montar nomes por combinação. Nenhum corresponde a pessoa
// real: são nomes comuns recombinados aleatoriamente.
const NOMES = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isadora', 'Joana', 'Karina', 'Lucas', 'Mariana', 'Nelson', 'Olívia', 'Paulo', 'Queila', 'Rafael', 'Sabrina', 'Thiago', 'Úrsula', 'Vinícius', 'Wagner', 'Yara', 'Zeca', 'Beatriz', 'Caio', 'Débora', 'Elias', 'Fernanda']
const SOBRENOMES = ['Almeida', 'Barbosa', 'Cardoso', 'Duarte', 'Esteves', 'Freitas', 'Gonçalves', 'Henriques', 'Ipanema', 'Jardim', 'Klein', 'Lemos', 'Marinho', 'Nogueira', 'Oliveira', 'Pacheco', 'Quintana', 'Ramos', 'Siqueira', 'Tavares', 'Ubaldo', 'Vieira', 'Wanderley', 'Xavier', 'Zanetti', 'Correia', 'Dantas', 'Machado', 'Prado', 'Rezende']
const DOMINIOS = ['exemplo.com', 'correio.exemplo', 'mail.exemplo.br', 'demo.exemplo']

function pessoa(r, i) {
  const nome = `${escolhe(r, NOMES)} ${escolhe(r, SOBRENOMES)} ${escolhe(r, SOBRENOMES)}`
  const login = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.')
  return {
    nome,
    email: `${login}.${i}@${escolhe(r, DOMINIOS)}`,
    telefone: `55${inteiro(r, 11, 99)}9${inteiro(r, 10000000, 99999999)}`,
  }
}

/** Sorteia um segmento respeitando a mistura do lançamento. */
function segmento(r) {
  const v = r()
  return v < 0.34 ? 'advogado' : v < 0.56 ? 'contador' : 'outro'
}
const PROFISSAO = { advogado: 'Advogado(a)', contador: 'Contador(a)', outro: 'Outro' }
const AREA = { advogado: 'Advocacia', contador: 'Contabilidade', outro: 'Outra' }

// ----------------------------------------------------------- criativos
const ANGULO = ['PROVA-SOCIAL', 'DOR', 'AUTORIDADE', 'CURIOSIDADE', 'OFERTA', 'BASTIDOR', 'DEPOIMENTO', 'COMPARACAO']
const FORMATO = ['VIDEO', 'CARROSSEL', 'IMAGEM', 'REELS']

export const criativos = umaVez(() => {
  const r = prng(777001)
  const dias = serie()
  const totalGasto = dias.reduce((s, d) => s + d.investCaptacaoFb, 0)
  const rascunho = []

  // 8 conjuntos, cada um com 4 a 7 criativos
  for (let c = 0; c < 8; c++) {
    const publico = escolhe(r, ['LAL-2-LEADS', 'INT-JURIDICO', 'ABERTO-25-55', 'LAL-1-COMPRADORES', 'RET-VIDEO-50', 'INT-CONTABIL'])
    const qtd = inteiro(r, 4, 7)
    for (let a = 0; a < qtd; a++) {
      const pag = PAGINAS[Math.floor(r() * PAGINAS.length)]
      const n = rascunho.length + 1
      rascunho.push({
        ad_id: `9${String(120000000000 + n * 137)}`,
        ad_name: `CN_CAP_${String(n).padStart(2, '0')}_${escolhe(r, ANGULO)}_${escolhe(r, FORMATO)}_${pag.slug.toUpperCase()}`,
        campanha: `CN | CAPTAÇÃO | ${c < 5 ? 'ESCALA' : 'TESTE'} 0${(c % 5) + 1}`,
        campaign_id: `2380000000${c}`,
        adset_id: `238100000${c}${a}`,
        adset_name: `CJ_${String(c + 1).padStart(2, '0')}_${publico}`,
        pag,
        forca: entre(r, 0.25, 1),
        diaEntrada: inteiro(r, 0, Math.max(0, dias.length - 4)),
      })
    }
  }

  // reparte a verba pela "força" de cada criativo e deriva o resto do funil
  const somaForca = rascunho.reduce((s, c) => s + c.forca, 0)
  return rascunho.map((c) => {
    const rr = rngDe(c.ad_name)
    const ehVideo = /VIDEO|REELS/.test(c.ad_name)
    const gasto = (totalGasto * c.forca) / somaForca
    const cpm = entre(rr, 36, 52)
    const impressoes = Math.round((gasto / cpm) * 1000)
    const cliques = Math.round(impressoes * entre(rr, 0.008, 0.019))
    const pv = Math.round(cliques * c.pag.connect * entre(rr, 0.95, 1.05))
    const leads = Math.round(pv * c.pag.conv * entre(rr, 0.92, 1.08))
    const leadsActive = Math.round(leads * entre(rr, 1.01, 1.08))
    const plays = ehVideo ? Math.round(cliques * entre(rr, 7, 14)) : 0

    // status espelha o que o gerenciador devolve em effective_status
    const st = rr()
    const status = st < 0.58 ? 'ACTIVE' : st < 0.8 ? 'PAUSED' : st < 0.93 ? 'ADSET_PAUSED' : 'CAMPAIGN_PAUSED'

    return {
      ad_id: c.ad_id, ad_name: c.ad_name, campanha: c.campanha, campaign_id: c.campaign_id,
      adset_id: c.adset_id, adset_name: c.adset_name,
      gasto: arred(gasto), impressoes, cliques, leads,
      plays_3s: plays,
      p75: Math.round(plays * entre(rr, 0.18, 0.34)),
      thruplay: Math.round(plays * entre(rr, 0.1, 0.22)),
      leadsActive,
      mql: Math.round(leadsActive * c.pag.mql * entre(rr, 0.93, 1.07)),
      status,
      veiculado_em: dias[c.diaEntrada]?.date ?? INICIO,
      thumb_url: null,
      url: urlPagina(c.pag.slug),
      instagram_url: urlPagina(c.pag.slug),
    }
  })
})

// ------------------------------------------------------------- rotas
// Cada rota é uma função (params) => corpo. Só roda quando a aba pede.
const R = {}

// ---- indicadores / tráfego
R['/indicadores'] = ({ from, to }) => ({ dias: recorte(from, to) })

R['/criativos/ctr-diario'] = ({ from, to }) => ({
  dias: recorte(from, to).map((d) => {
    const r = rngDe('ctr' + d.date)
    const impV = Math.round(d.impressoes * entre(r, 0.55, 0.7))
    const impI = d.impressoes - impV
    return {
      date: d.date,
      impressoesVideo: impV,
      cliquesVideo: Math.round(impV * entre(r, 0.011, 0.016)),
      impressoesImagem: impI,
      cliquesImagem: Math.round(impI * entre(r, 0.008, 0.013)),
    }
  }),
})

// ---- leads
// `utm` isola o tráfego pago por canal: o CPL por canal não pode ter
// orgânico no denominador, então FB e GoogleAds vêm separados do total.
R['/leads/active'] = ({ from, to, utm }) =>
  recorte(from, to).flatMap((d) => {
    const r = rngDe('la' + d.date)
    const total = utm === 'FB' ? d.activeFb : utm === 'GoogleAds' ? d.activeGg : d.leadsActive
    const adv = Math.round(total * entre(r, 0.31, 0.37))
    const cont = Math.round(total * entre(r, 0.19, 0.25))
    return [
      { data: d.date, segmento: 'advogado', leads: adv },
      { data: d.date, segmento: 'contador', leads: cont },
      { data: d.date, segmento: 'outro', leads: total - adv - cont },
    ]
  })

const CAMPANHAS_UTM = ['cn-captacao-escala', 'cn-captacao-teste', 'cn-remarketing', 'cn-organico']

R['/leads/active/detalhe'] = ({ from, to }) => {
  const out = []
  const cri = criativos()
  for (const d of recorte(from, to)) {
    const r = rngDe('det' + d.date)
    for (let i = 0; i < d.leadsActive; i++) {
      const seg = segmento(r)
      const pag = PAGINAS[Math.floor(r() * PAGINAS.length)]
      const fonte = r()
      out.push({
        contact_id: `c${d.date.replace(/-/g, '')}${String(i).padStart(4, '0')}`,
        ...pessoa(r, out.length),
        segmento: seg,
        profissao: PROFISSAO[seg],
        opt_in_at: `${d.date}T${String(inteiro(r, 7, 23)).padStart(2, '0')}:${String(inteiro(r, 0, 59)).padStart(2, '0')}:00Z`,
        origem: urlPagina(pag.slug),
        utm_source: fonte < 0.78 ? 'FB' : fonte < 0.93 ? 'GoogleAds' : 'organico',
        utm_campaign: escolhe(r, CAMPANHAS_UTM),
        utm_content: escolhe(r, cri).ad_name,
        grupo: r() < 0.71 ? 'grupo-01' : null,
        excluido: false,
      })
    }
  }
  return out
}

// ---- páginas
R['/paginas'] = ({ from, to }) => {
  const out = []
  let id = 1
  for (const d of recorte(from, to)) {
    for (const pag of PAGINAS) {
      const r = rngDe('pg' + d.date + pag.slug)
      const gasto = d.investCaptacaoFb * pag.peso * entre(r, 0.9, 1.1)
      const cliques = Math.round(gasto / (entre(r, 2.6, 3.9) * pag.cpcMult))
      const pv = Math.round(cliques * pag.connect * entre(r, 0.95, 1.05))
      out.push({
        id: id++, evento_id: 'cn-2026', data: d.date, url: urlPagina(pag.slug),
        gasto: arred(gasto),
        impressoes: Math.round((gasto / entre(r, 38, 49)) * 1000),
        cliques, page_views: pv,
        leads: Math.round(pv * pag.conv * entre(r, 0.94, 1.06)),
        atualizado_em: `${HOJE_ISO}T06:12:00Z`,
      })
    }
  }
  return out
}

R['/paginas/active'] = ({ from, to }) => {
  const dias = recorte(from, to)
  const paginas = PAGINAS.map((pag) => {
    let leads = 0
    for (const d of dias) {
      const r = rngDe('pa' + d.date + pag.slug)
      leads += Math.round(d.leadsActive * pag.peso * entre(r, 0.92, 1.08))
    }
    const r = rngDe('mq' + pag.slug)
    const adv = Math.round(leads * pag.mql * entre(r, 0.58, 0.64))
    const cont = Math.round(leads * pag.mql * entre(r, 0.36, 0.42))
    return { origem: urlPagina(pag.slug), leads, advogado: adv, contador: cont, mql: adv + cont }
  })
  const soma = (k) => paginas.reduce((s, p) => s + p[k], 0)
  return {
    total: soma('leads'), advogado: soma('advogado'), contador: soma('contador'), mql: soma('mql'),
    paginas: paginas.sort((a, b) => b.leads - a.leads),
  }
}

// ---- criativos (a rota /criativos legada devolve vazio no produto também)
R['/criativos'] = () => []
R['/criativos/lista'] = ({ from, to }) => {
  const dias = recorte(from, to)
  const fatia = dias.length / serie().length
  if (fatia >= 0.999) return criativos()
  // no recorte, escala o volume e some quem ainda não tinha subido
  return criativos()
    .filter((c) => c.veiculado_em <= (to ?? HOJE_ISO))
    .map((c) => ({
      ...c,
      gasto: arred(c.gasto * fatia),
      impressoes: Math.round(c.impressoes * fatia),
      cliques: Math.round(c.cliques * fatia),
      leads: Math.round(c.leads * fatia),
      leadsActive: Math.round(c.leadsActive * fatia),
      mql: Math.round(c.mql * fatia),
      plays_3s: Math.round(c.plays_3s * fatia),
      p75: Math.round(c.p75 * fatia),
      thruplay: Math.round(c.thruplay * fatia),
    }))
}

// ---- Google
const CAMPANHAS_GG = [
  'CN | PESQUISA | MARCA', 'CN | PESQUISA | GENÉRICAS', 'CN | PMAX | CAPTAÇÃO',
  'CN | DISPLAY | REMARKETING', 'CN | YOUTUBE | TOPO', 'CN | DEMAND GEN | FRIO',
]
const PESOS_GG = [0.09, 0.24, 0.31, 0.08, 0.13, 0.15]

R['/google/campanhas'] = ({ from, to }) => {
  const total = recorte(from, to).reduce((s, d) => s + d.investCaptacaoGg, 0)
  return CAMPANHAS_GG.map((nome, i) => {
    const r = rngDe('gg' + nome)
    const gasto = total * PESOS_GG[i]
    const cliques = Math.round(gasto / entre(r, 2.2, 3.6))
    const la = Math.round(gasto / entre(r, 9, 13))
    return {
      campaign_id: `gg-${2200 + i}`, campanha: nome, gasto: arred(gasto),
      impressoes: Math.round(cliques / entre(r, 0.02, 0.07)),
      cliques, leadsActive: la, mql: Math.round(la * entre(r, 0.48, 0.66)),
    }
  })
}

R['/google/criativos'] = (p) => {
  const out = []
  R['/google/campanhas'](p).forEach((c, ci) => {
    const r = rngDe('ggc' + c.campanha)
    const n = inteiro(r, 4, 8)
    for (let i = 0; i < n; i++) {
      const f = entre(r, 0.5, 1.5) / n
      out.push({
        ad_id: `gga-${ci}${i}`,
        ad_name: `${c.campanha.split('|')[1].trim()} · anúncio ${i + 1}`,
        campanha: c.campanha, campaign_id: c.campaign_id,
        adset_id: `ggs-${ci}`, adset_name: `Grupo ${ci + 1}`,
        gasto: arred(c.gasto * f),
        impressoes: Math.round(c.impressoes * f),
        cliques: Math.round(c.cliques * f),
        leadsActive: Math.round(c.leadsActive * f),
        mql: Math.round(c.mql * f),
      })
    }
  })
  return out
}

// ---- grupo de WhatsApp
R['/grupos/ingresso'] = ({ from, to }) =>
  recorte(from, to).flatMap((d, i) =>
    SEGMENTOS.map((seg) => {
      const r = rngDe('gi' + d.date + seg)
      const entradas = Math.round(d.grupo * parteDe(seg) * entre(r, 0.93, 1.07))
      return {
        id: `${d.date}-${seg}`, evento_id: 'cn-2026', data: d.date, segmento: seg,
        release_id: `rel-0${(i % 3) + 1}`, release_nome: `Turma ${(i % 3) + 1}`,
        entradas,
        saidas: Math.round(entradas * entre(r, 0.03, 0.08)),
        cliques: Math.round(entradas * entre(r, 1.1, 1.35)),
        participantes: null,
        atualizado_em: `${HOJE_ISO}T06:20:00Z`,
        admins: 3,
      }
    }),
  )

R['/grupos/ingresso-taxa'] = ({ from, to }) => {
  const totalLeads = recorte(from, to).reduce((s, d) => s + d.leadsActive, 0)
  const segs = SEGMENTOS.map((seg) => {
    const r = rngDe('gt' + seg)
    const leads = Math.round(totalLeads * parteDe(seg))
    const taxa = entre(r, 0.63, 0.78)
    const il = Math.round(leads * taxa)
    return {
      segmento: seg, leads, ingressos: Math.round(il * 1.06), no_grupo: Math.round(il * 0.94),
      ingressos_lead: il, sem_lead: Math.round(il * 0.06), no_grupo_lead: Math.round(il * 0.94),
      taxa_ingresso: arred(taxa, 4),
    }
  })
  const s = (k) => segs.reduce((a, x) => a + x[k], 0)
  return {
    total: {
      ingressos: s('ingressos'), leads: s('leads'), ingressos_lead: s('ingressos_lead'),
      sem_lead: s('sem_lead'), no_grupo_lead: s('no_grupo_lead'),
      taxa_ingresso: arred(s('ingressos_lead') / (s('leads') || 1), 4),
    },
    segmentos: segs,
    estado: 'ok',
  }
}

R['/grupos/ingresso-coorte'] = ({ from, to }) => {
  const linha = (leads, r) => {
    const entraram = Math.round(leads * entre(r, 0.63, 0.78))
    const sairam = Math.round(entraram * entre(r, 0.04, 0.09))
    return {
      leads, entraram, permanecem: entraram - sairam, sairam, nao_entraram: leads - entraram,
      taxa_ingresso: arred(entraram / (leads || 1), 4),
      taxa_permanencia: arred((entraram - sairam) / (entraram || 1), 4),
    }
  }
  const dias = recorte(from, to).map((d) => ({ dia: d.date, ...linha(d.leadsActive, rngDe('co' + d.date)) }))
  const totalLeads = dias.reduce((s, d) => s + d.leads, 0)
  const segs = SEGMENTOS.map((seg) => ({
    segmento: seg,
    ...linha(Math.round(totalLeads * parteDe(seg)), rngDe('cos' + seg)),
  }))
  const s = (k) => dias.reduce((a, x) => a + x[k], 0)
  return {
    total: {
      leads: s('leads'), entraram: s('entraram'), permanecem: s('permanecem'),
      sairam: s('sairam'), nao_entraram: s('nao_entraram'),
      taxa_ingresso: arred(s('entraram') / (s('leads') || 1), 4),
      taxa_permanencia: arred(s('permanecem') / (s('entraram') || 1), 4),
    },
    dias, segmentos: segs, estado: 'ok',
  }
}

R['/grupos/ingresso-dia'] = ({ from, to }) => {
  const dias = []
  for (const d of recorte(from, to)) {
    for (const seg of SEGMENTOS) {
      const r = rngDe('gd' + d.date + seg)
      const entradas = Math.round(d.grupo * parteDe(seg) * entre(r, 0.92, 1.08))
      const reentradas = Math.round(entradas * entre(r, 0.02, 0.06))
      dias.push({
        evento_id: 'cn-2026', dia: d.date, segmento: seg,
        eventos_webhook: entradas + reentradas,
        eventos_oficial: Math.round((entradas + reentradas) * entre(r, 0.95, 1.04)),
        entradas, pessoas_novas: entradas - reentradas, reentradas,
        pessoas_novas_ajustada: entradas - reentradas,
      })
    }
  }
  const campos = ['entradas', 'pessoas_novas', 'reentradas', 'eventos_webhook', 'eventos_oficial']
  const bloco = (ls) => Object.fromEntries(campos.map((k) => [k, ls.reduce((a, x) => a + x[k], 0)]))
  return {
    total: bloco(dias),
    por_segmento: Object.fromEntries(SEGMENTOS.map((s) => [s, bloco(dias.filter((d) => d.segmento === s))])),
    dias,
  }
}

R['/grupos/membros'] = ({ from, to }) => {
  const out = []
  for (const d of recorte(from, to)) {
    const r = rngDe('gm' + d.date)
    for (let i = 0; i < d.grupo; i++) {
      const p = pessoa(r, out.length)
      const saiu = r() < 0.055
      out.push({
        numero: p.telefone, nome: p.nome, email: p.email, segmento: segmento(r),
        grupo: `Curso Nacional · Turma ${(out.length % 3) + 1}`,
        no_grupo: !saiu,
        entrou_em: `${d.date}T${String(inteiro(r, 8, 22)).padStart(2, '0')}:05:00Z`,
        saiu_em: saiu ? `${d.date}T23:40:00Z` : null,
        excluido: false, eh_lead: true, opt_in_at: `${d.date}T09:00:00Z`,
      })
    }
  }
  return out
}

R['/grupos/alertas'] = () => []

// ---- pesquisa de qualificação
const FATURAMENTO = ['Até R$ 5 mil', 'R$ 5 a 15 mil', 'R$ 15 a 30 mil', 'Acima de R$ 30 mil']
const OBJETIVO = ['Atender um cliente que já tenho', 'Criar uma nova fonte de receita', 'Me aprofundar tecnicamente', 'Ainda estou explorando']
const ATUACAO = ['Não atuo', 'Já atuo, mas não com um método claro', 'Já atuo e sigo um método bem definido']
const FORMACAO = ['Nunca estudei sobre isso', 'Estudei por conta própria', 'Já fiz algum curso ou formação']
const CLIENTES = ['Nenhuma ainda', 'De 1 a 3', 'De 4 a 10', 'Mais de 10']
const ESTUDO = ['Livros e materiais técnicos', 'Vídeos e conteúdos gratuitos', 'Na prática, com meus próprios casos', 'Conversando com colegas da área', 'Outro']
const TEMPO_ATUA = ['Menos de 1 ano', 'De 1 a 3 anos', 'Mais de 3 anos']
const IDADE = ['Até 29', '30 a 39', '40 a 49', '50 ou mais']
const GENERO = ['Feminino', 'Masculino']

/** Respondentes da pesquisa, gerados uma vez e reaproveitados nas 5 rotas. */
const respondentes = umaVez(() => {
  const out = []
  for (const d of serie()) {
    const r = rngDe('pq' + d.date)
    for (let i = 0; i < d.pesquisas; i++) {
      const seg = segmento(r)
      out.push({
        ...pessoa(r, out.length + 500000),
        dia: d.date,
        segmento: seg,
        profissao: PROFISSAO[seg],
        respondido_em: `${d.date}T${String(inteiro(r, 8, 23)).padStart(2, '0')}:30:00Z`,
        answers: {
          area: AREA[seg],
          faturamento: escolhe(r, FATURAMENTO),
          objetivo: escolhe(r, OBJETIVO),
          atua_holding: escolhe(r, ATUACAO),
          formacao_holding: escolhe(r, FORMACAO),
          quantos_clientes: escolhe(r, CLIENTES),
          estudo_como: escolhe(r, ESTUDO),
          atua_tempo: escolhe(r, TEMPO_ATUA),
          idade: escolhe(r, IDADE),
          genero: escolhe(r, GENERO),
        },
      })
    }
  }
  return out
})

const respondentesNo = (from, to) =>
  respondentes().filter((x) => (!from || x.dia >= from) && (!to || x.dia <= to))

const conta = (ls, fn) => ls.reduce((m, x) => ((m[fn(x)] = (m[fn(x)] || 0) + 1), m), {})

R['/qualificacao/resumo'] = ({ from, to }) => {
  const rs = respondentesNo(from, to)
  const base = recorte(from, to).reduce((s, d) => s + d.leadsActive, 0)
  const dist = {}
  for (const chave of ['area', 'faturamento', 'objetivo', 'atua_holding', 'formacao_holding', 'quantos_clientes', 'estudo_como', 'atua_tempo', 'idade', 'genero']) {
    dist[chave] = conta(rs, (x) => x.answers[chave])
  }
  const adv = rs.filter((x) => x.segmento === 'advogado').length
  const cont = rs.filter((x) => x.segmento === 'contador').length
  const saud = Math.round(rs.length * 0.93)
  const n = rs.length || 1
  return {
    total: rs.length, brutas: Math.round(rs.length * 1.04), leads: base,
    taxa: Math.round((rs.length / (base || 1)) * 100),
    taxa_ac: arred(rs.length / (base || 1), 4),
    taxa_ac_madura: arred((rs.length / (base || 1)) * 1.06, 4),
    base_ac: base, base_madura: Math.round(base * 0.94), respostas_ac: rs.length,
    periodo: null, saudaveis: saud, pct_saudavel: arred(saud / n, 4),
    distribuicao: dist,
    mql: adv + cont, mql_advogado: adv, mql_contador: cont, mql_outro: rs.length - adv - cont,
    pct_mql: arred((adv + cont) / n, 4),
    pct_mql_advogado: arred(adv / n, 4),
    pct_mql_contador: arred(cont / n, 4),
  }
}

R['/qualificacao/diario'] = ({ from, to }) => {
  let acc = 0
  const porDia = conta(respondentes(), (x) => x.dia)
  const dias = recorte(from, to).map((d) => {
    const rs = respondentes().filter((x) => x.dia === d.date)
    const adv = rs.filter((x) => x.segmento === 'advogado').length
    const cont = rs.filter((x) => x.segmento === 'contador').length
    acc += porDia[d.date] || 0
    return { dia: d.date, total: rs.length, advogado: adv, contador: cont, outro: rs.length - adv - cont, acumulado: acc }
  })
  return { dias, total: acc }
}

R['/qualificacao/taxa-diaria'] = ({ from, to }) => {
  const porDia = conta(respondentes(), (x) => x.dia)
  return {
    dias: recorte(from, to).map((d) => {
      const rp = porDia[d.date] || 0
      return { dia: d.date, base: d.leadsActive, respostas: rp, taxa: arred(rp / (d.leadsActive || 1), 4) }
    }),
  }
}

R['/qualificacao/alunos'] = ({ from, to }) =>
  respondentesNo(from, to).map((x) => ({
    email: x.email, nome: x.nome, telefone: x.telefone, profissao: x.profissao,
    respondido_em: x.respondido_em, answers: x.answers,
  }))

R['/qualificacao/geral'] = ({ from, to }) => {
  const rs = respondentesNo(from, to)
  const leads = recorte(from, to).reduce((s, d) => s + d.leadsActive, 0)
  const r = rngDe('qg')
  return {
    leads: {
      total: leads,
      por_origem: { 'auto-cadastro': Math.round(leads * 0.97), seed: leads - Math.round(leads * 0.97) },
      por_profissao: conta(rs, (x) => x.profissao),
    },
    perfis: { total: Math.round(rs.length * 1.02), alunos: rs.length, admins: 4 },
    respostas: {
      total: rs.length, brutas: Math.round(rs.length * 1.04), saudaveis: Math.round(rs.length * 0.93),
      warn: Math.round(rs.length * 0.05), bad: Math.round(rs.length * 0.02),
      duplicadas: Math.round(rs.length * 0.04),
      taxa: Math.round((rs.length / (leads || 1)) * 100), pct_saudavel: 0.93,
    },
    progresso: {
      alunos_com_progresso: Math.round(rs.length * 0.41),
      por_aula: [1, 2, 3].map((a) => ({
        aula: a,
        presentes: Math.round(rs.length * [0.41, 0.33, 0.28][a - 1] * entre(r, 0.95, 1.05)),
        exercicios: Math.round(rs.length * [0.22, 0.16, 0.12][a - 1] * entre(r, 0.95, 1.05)),
      })),
    },
  }
}

// ---- caderno de trabalho
const acessosWb = umaVez(() =>
  respondentes().flatMap((x) => {
    const r = rngDe('wb' + x.email)
    if (r() > 0.34) return [] // nem todo respondente cria conta
    const acessou = r() < 0.52
    return [{
      email: x.email, nome: x.nome, telefone: x.telefone, profissao: x.profissao,
      faturamento: x.answers.faturamento,
      conta_criada_em: `${x.dia}T12:00:00Z`,
      ultimo_login: acessou ? `${x.dia}T18:00:00Z` : null,
      ja_acessou: acessou,
      logou_de_novo: acessou && r() < 0.38,
      abriu_apostila: acessou && r() < 0.61,
      preencheu_apostila: acessou && r() < 0.27,
      origem_pesquisa: 'pesquisa-qualificacao',
      respondeu_pesquisa_em: x.respondido_em,
      dias_desde_ultimo_login: inteiro(r, 0, 14),
      dia: x.dia,
    }]
  }),
)

R['/workbook/acessos'] = ({ from, to }) =>
  acessosWb().filter((x) => (!from || x.dia >= from) && (!to || x.dia <= to))

R['/workbook/resumo'] = (p) => {
  const a = R['/workbook/acessos'](p)
  const n = (f) => a.filter(f).length
  const acess = n((x) => x.ja_acessou)
  const preench = n((x) => x.preencheu_apostila)
  const abriu = n((x) => x.abriu_apostila)
  const rs = respondentesNo(p.from, p.to)
  return {
    estado: 'ok',
    pesquisas_respondidas: rs.length,
    pesquisas_completas: Math.round(rs.length * 0.93),
    contas_criadas: a.length,
    ja_acessaram: acess,
    logaram_de_novo: n((x) => x.logou_de_novo),
    usaram_anotacoes: Math.round(preench * 0.72),
    nunca_acessaram: a.length - acess,
    taxa_acesso: arred(acess / (a.length || 1), 4),
    acessos_24h: Math.round(acess * 0.09),
    acessos_7d: Math.round(acess * 0.38),
    abriram_apostila: abriu,
    preencheram_apostila: preench,
    taxa_preenchimento: arred(preench / (abriu || 1), 4),
    lacunas_total: preench * 9,
    lacunas_recorde: 41,
    lacunas_do_caderno: 48,
    magic_links_usados: Math.round(acess * 0.83),
  }
}

R['/workbook/acessos-diario'] = ({ from, to }) => {
  const porDia = conta(acessosWb().filter((x) => x.ja_acessou), (x) => x.dia)
  return recorte(from, to).map((d) => ({ data: d.date, acessos: porDia[d.date] || 0 }))
}

R['/workbook/engajamento'] = (p) =>
  R['/workbook/acessos'](p)
    .filter((x) => x.abriu_apostila)
    .slice(0, 60)
    .map((x) => {
      const r = rngDe('en' + x.email)
      const lac = x.preencheu_apostila ? inteiro(r, 3, 44) : 0
      return {
        email: x.email, nome: x.nome, lacunas_preenchidas: lac,
        pct_do_caderno: arred(lac / 48, 4), preencheu_algo: lac > 0,
        abriu_em: x.conta_criada_em, ultima_atividade: x.ultimo_login,
        dias_sem_atividade: x.dias_desde_ultimo_login,
      }
    })

// ---- disparos e mensageria
const CANAIS = [
  { canal: 'whatsapp', label: 'WhatsApp (API)', preco: 0.0432 },
  { canal: 'email', label: 'E-mail', preco: 0.0009 },
  { canal: 'sms', label: 'SMS / Ligação', preco: 0.118 },
]
const PECAS = ['Convite para o grupo', 'Lembrete do encontro 1', 'Caderno liberado', 'Última chamada', 'Aviso de bônus', 'Recado do especialista', 'Confirmação de presença', 'Reengajamento']

const disparosBase = umaVez(() => {
  const out = []
  let id = 1
  for (const d of serie()) {
    if (d.investDisparos <= 0) continue
    for (const c of CANAIS) {
      const r = rngDe('dp' + d.date + c.canal)
      if (r() < 0.35) continue
      for (const seg of SEGMENTOS) {
        const base = Math.round(d.leadsActive * parteDe(seg) * entre(r, 2, 5))
        const entregues = Math.round(base * (c.canal === 'email' ? entre(r, 0.9, 0.97) : entre(r, 0.85, 0.95)))
        const recebidos = Math.round(entregues * (c.canal === 'email' ? entre(r, 0.28, 0.42) : entre(r, 0.55, 0.78)))
        out.push({
          id: id++, evento_id: 'cn-2026', data: d.date, canal: c.canal, segmento: seg,
          nome: `${escolhe(r, PECAS)} · ${seg}`,
          base, entregues, recebidos,
          cliques: Math.round(recebidos * entre(r, 0.12, 0.34)),
          falhas: base - entregues,
          preco: c.preco,
          atualizado_em: `${HOJE_ISO}T06:30:00Z`,
        })
      }
    }
  }
  return out
})

const disparosNo = ({ from, to }) =>
  disparosBase().filter((x) => (!from || x.data >= from) && (!to || x.data <= to))

R['/disparos'] = (p) =>
  disparosNo(p).map((x) => ({
    evento_id: x.evento_id, data: x.data, canal: x.canal, segmento: x.segmento, nome: x.nome,
    base: x.base, entregues: x.entregues, recebidos: x.recebidos, cliques: x.cliques,
    atualizado_em: x.atualizado_em,
  }))

R['/disparos/resumo'] = (p) => {
  const ls = disparosNo(p)
  return CANAIS.map((c) => {
    const f = ls.filter((x) => x.canal === c.canal)
    const s = (k) => f.reduce((a, x) => a + x[k], 0)
    return { canal: c.canal, base: s('base'), entregues: s('entregues'), recebidos: s('recebidos'), cliques: s('cliques') }
  }).filter((x) => x.base > 0)
}

R['/disparos/performance'] = (p) =>
  disparosNo(p).map((x) => ({
    evento_id: x.evento_id, data: x.data, canal: x.canal, segmento: x.segmento, nome: x.nome,
    volume: x.base, conversoes: x.cliques, saidas: Math.round(x.cliques * 0.04),
    participantes: null, admins: null, taxa_ingresso: null, taxa_retencao: null,
    taxa_entrega: arred(x.entregues / (x.base || 1), 4),
    taxa_abertura: arred(x.recebidos / (x.entregues || 1), 4),
    taxa_clique: arred(x.cliques / (x.recebidos || 1), 4),
    taxa_resposta: null, estado: 'ok', atualizado_em: x.atualizado_em,
  }))

R['/disparos/desempenho'] = (p) => {
  const ls = disparosNo(p)
  const bloco = (f) => {
    const s = (k) => f.reduce((a, x) => a + x[k], 0)
    const env = s('base'), ent = s('entregues'), ab = s('recebidos'), cl = s('cliques')
    return {
      enviados: env, entregues: ent, aberturas: ab, cliques: cl, bounces: env - ent,
      taxa_entrega: arred(ent / (env || 1), 4), taxa_abertura: arred(ab / (ent || 1), 4),
      taxa_clique: arred(cl / (ent || 1), 4), taxa_clique_abertura: arred(cl / (ab || 1), 4),
    }
  }
  const email = ls.filter((x) => x.canal === 'email')
  const dias = recorte(p.from, p.to)
  const entradas = dias.reduce((s, d) => s + d.grupo, 0)
  const cliques = Math.round(entradas * 1.2)
  const saidas = Math.round(entradas * 0.055)
  return {
    email: {
      estado: 'ok', total: bloco(email),
      segmentos: SEGMENTOS.map((s) => ({ segmento: s, ...bloco(email.filter((x) => x.segmento === s)) })),
    },
    grupo: {
      estado: 'ok',
      total: {
        cliques, entradas, saidas,
        taxa_ingresso: arred(entradas / (cliques || 1), 4),
        taxa_evasao: arred(saidas / (entradas || 1), 4),
      },
      segmentos: SEGMENTOS.map((s) => {
        const e = Math.round(entradas * parteDe(s))
        const c = Math.round(cliques * parteDe(s))
        const sa = Math.round(e * entre(rngDe('ev' + s), 0.03, 0.08))
        return {
          segmento: s, cliques: c, entradas: e, saidas: sa,
          taxa_ingresso: arred(e / (c || 1), 4), taxa_evasao: arred(sa / (e || 1), 4),
        }
      }),
    },
  }
}

R['/mensageria/matriz'] = (p) => {
  const itens = disparosNo(p).map((x) => {
    const txEnt = x.entregues / (x.base || 1)
    const txAb = x.recebidos / (x.entregues || 1)
    const score = arred(txEnt * 0.35 + txAb * 0.65, 4)
    return {
      id: `m${x.id}`, data: x.data, campanha: x.nome, canal: x.canal,
      natureza: x.id % 4 === 0 ? 'automacao' : 'disparo', segmento: x.segmento,
      enviados: x.base, entregues: x.entregues, abertos: x.recebidos, cliques: x.cliques,
      falhas: x.falhas, taxa_entrega: arred(txEnt, 4),
      categoria: x.canal === 'email' ? 'marketing' : 'utility',
      custo: arred(x.entregues * x.preco), preco_aplicado: x.preco, custo_origem: 'tabela',
      desempenho: score >= 0.72 ? 'otimo' : score >= 0.6 ? 'bom' : score >= 0.48 ? 'atencao' : 'ruim',
      score,
    }
  })
  const s = (f, k) => f.reduce((a, x) => a + (x[k] || 0), 0)
  const tot = (f) => {
    const env = s(f, 'enviados'), ent = s(f, 'entregues'), ab = s(f, 'abertos'), cl = s(f, 'cliques')
    const custo = arred(s(f, 'custo'))
    return {
      itens: f.length, enviados: env, entregues: ent, abertos: ab, cliques: cl,
      falhas: s(f, 'falhas'), custo,
      taxa_entrega: arred(ent / (env || 1), 4), taxa_abertura: arred(ab / (ent || 1), 4),
      taxa_clique: arred(cl / (ab || 1), 4), taxa_falha: arred(s(f, 'falhas') / (env || 1), 4),
      cpc: arred(custo / (cl || 1)), custo_por_entrega: arred(custo / (ent || 1)),
      custo_parcial: false,
    }
  }
  const ord = [...itens].sort((a, b) => b.score - a.score)
  const cartao = (x) => ({
    id: x.id, campanha: x.campanha, canal: x.canal, desempenho: x.desempenho, score: x.score,
    motivo: x.score >= 0.6 ? 'leitura acima da média do canal' : 'leitura abaixo da média do canal',
    custo: x.custo, taxa_abertura: arred(x.abertos / (x.entregues || 1), 4),
  })
  return {
    estado: 'ok', atualizado_em: `${HOJE_ISO}T06:40:00Z`,
    destaques: { melhores: ord.slice(0, 3).map(cartao), piores: ord.slice(-3).reverse().map(cartao) },
    total: tot(itens),
    custo_por_canal: CANAIS.map((c) => ({
      canal: c.canal, label: c.label, estado: 'ok',
      custo: arred(s(itens.filter((x) => x.canal === c.canal), 'custo')),
    })),
    canais: CANAIS.map((c) => {
      const f = itens.filter((x) => x.canal === c.canal)
      const d = (v) => f.filter((x) => x.desempenho === v).length
      return {
        canal: c.canal, label: c.label, estado: 'ok', ...tot(f),
        itens_marketing: f.filter((x) => x.categoria === 'marketing').length,
        desempenho_resumo: { otimo: d('otimo'), bom: d('bom'), atencao: d('atencao'), ruim: d('ruim'), sem_leitura: 0, sem_referencia: 0 },
        por_natureza: {
          disparo: f.filter((x) => x.natureza === 'disparo').length,
          automacao: f.filter((x) => x.natureza === 'automacao').length,
        },
      }
    }),
    itens,
    ressalvas: ['Custos de WhatsApp usam a tabela de utility vigente na janela.'],
  }
}

R['/unnichat/resumo'] = (p) => {
  const totalLeads = recorte(p.from, p.to).reduce((s, d) => s + d.leadsActive, 0)
  const segs = SEGMENTOS.map((seg) => {
    const contatos = Math.round(totalLeads * parteDe(seg))
    return { segmento: seg, contatos, convite_grupo: Math.round(contatos * 0.94), workbook: Math.round(contatos * 0.41) }
  })
  const s = (k) => segs.reduce((a, x) => a + x[k], 0)
  return {
    estado: 'ok',
    total: { contatos: s('contatos'), convite_grupo: s('convite_grupo'), workbook: s('workbook') },
    segmentos: segs,
  }
}

R['/unnichat/custo'] = (p) => {
  const preco = 0.0432
  const segs = R['/unnichat/resumo'](p).segmentos.map((x) => {
    const env = x.convite_grupo + x.workbook
    return { segmento: x.segmento, enviados: env, custo: arred(env * preco) }
  })
  const s = (k) => segs.reduce((a, x) => a + x[k], 0)
  return { estado: 'ok', preco_utility: preco, total: { enviados: s('enviados'), custo: arred(s('custo')) }, segmentos: segs }
}

// ---- equipe (ClickUp). Papéis, nunca nomes de pessoas reais.
const EQUIPE = [
  { id: 'op1', nome: 'Analista de dados', papel: 'Dados' },
  { id: 'op2', nome: 'Gestor de tráfego', papel: 'Mídia' },
  { id: 'op3', nome: 'Redação', papel: 'Copy' },
  { id: 'op4', nome: 'Design', papel: 'Criação' },
  { id: 'op5', nome: 'Coordenação', papel: 'Gestão' },
]
const TAREFAS = ['Subir criativos do lote 3', 'Revisar página nv1-b', 'Fechar relatório do dia', 'Ajustar público do CJ_04', 'Conferir integração do grupo', 'Roteiro do encontro 2', 'Arte do lembrete D-1', 'Auditar UTMs', 'Atualizar planilha de custos', 'Briefing dos criativos de escala']

const equipeBase = umaVez(() =>
  EQUIPE.map((m) => {
    const r = rngDe('eq' + m.id)
    const total = inteiro(r, 9, 18)
    return {
      ...m,
      tarefas: Array.from({ length: total }, (_, t) => {
        const v = r()
        const coluna = v < 0.42 ? 'concluida' : v < 0.58 ? 'revisao' : v < 0.78 ? 'fazendo' : 'a_fazer'
        return {
          id: `t-${m.id}-${t}`, nome: escolhe(r, TAREFAS), coluna,
          atrasada: coluna !== 'concluida' && r() < 0.22,
          entregue: coluna === 'concluida' || coluna === 'revisao',
        }
      }),
    }
  }),
)

R['/equipe/geral'] = () => {
  const resumo = equipeBase().map((m) => {
    const c = m.tarefas.filter((t) => t.coluna === 'concluida').length
    const rv = m.tarefas.filter((t) => t.coluna === 'revisao').length
    return {
      membro_id: m.id, membro_nome: m.nome, papel_rotulo: m.papel, clickup_id: `cu-${m.id}`,
      total: m.tarefas.length, concluidas: c, entregues: c + rv,
      pendentes: m.tarefas.length - c,
      atrasadas: m.tarefas.filter((t) => t.atrasada).length,
      tarefas: m.tarefas, pct: Math.round((c / m.tarefas.length) * 100),
    }
  })
  const s = (k) => resumo.reduce((a, x) => a + x[k], 0)
  return {
    placar: {
      total: s('total'), entregues: s('entregues'), concluidas: s('concluidas'),
      em_revisao: s('entregues') - s('concluidas'), pendentes: s('pendentes'), atrasadas: s('atrasadas'),
    },
    resumo,
  }
}

R['/equipe/kanban'] = () => ({
  colunas: ['a_fazer', 'fazendo', 'revisao', 'concluida'],
  operadores: equipeBase().map((m) => {
    const porCol = (c) => m.tarefas.filter((t) => t.coluna === c)
    return {
      membro_id: m.id, membro_nome: m.nome, papel_rotulo: m.papel, clickup_id: `cu-${m.id}`,
      total: m.tarefas.length,
      entregues: porCol('concluida').length + porCol('revisao').length,
      atrasadas: m.tarefas.filter((t) => t.atrasada).length,
      divididas: 0,
      colunas: {
        a_fazer: porCol('a_fazer'), fazendo: porCol('fazendo'),
        revisao: porCol('revisao'), concluida: porCol('concluida'),
      },
      outros: [],
    }
  }),
})

R['/equipe/semana'] = () => {
  const dias = serie().slice(-7).map((d) => d.date)
  return {
    inicio: dias[0], fim: dias[dias.length - 1], dias,
    operadores: equipeBase().map((m) => ({
      membro_id: m.id, membro_nome: m.nome, papel_rotulo: m.papel,
      dias: dias.map((dia) => {
        const r = rngDe('sm' + m.id + dia)
        return { dia, concluidas: inteiro(r, 0, 4), atrasadas: r() < 0.2 ? 1 : 0 }
      }),
    })),
  }
}

// ------------------------------------------------------------- despacho
/** Resolve uma rota. Devolve `undefined` se a rota não é conhecida. */
export function resolver(rota, params) {
  const fn = R[rota]
  return fn ? fn(params) : undefined
}

/** Forma neutra para rota desconhecida: lista vazia ou objeto vazio. */
export function respostaPadrao(rota) {
  return /(lista|leads|criativos|paginas|membros|alunos|acessos|disparos|s)$/.test(rota) ? [] : {}
}

export const ROTAS = Object.keys(R)
export { METAS }
