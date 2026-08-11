// =====================================================================
// Parâmetros do lançamento FICTÍCIO usado na demonstração.
//
// Duas decisões importantes aqui:
//
// 1. NENHUMA meta real. Todos os alvos abaixo foram inventados para esta
//    demo. Os alvos de operação do painel de produção não aparecem em
//    lugar nenhum deste build.
//
// 2. A janela é ancorada em HOJE, não em datas fixas. Um portfólio com
//    datas cravadas envelhece: alguns meses depois o visitante abre e vê
//    um lançamento encerrado, contagem regressiva zerada e projeção sem
//    sentido. Ancorando em hoje, a demo está sempre no meio da captação —
//    que é justamente o estado em que o painel tem algo a dizer.
// =====================================================================

const HOJE = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

const dia = (iso) => new Date(iso + 'T12:00:00')
const somaDias = (iso, n) => {
  const t = dia(iso)
  t.setDate(t.getDate() + n)
  return t.toLocaleDateString('en-CA')
}
export const diffDias = (a, b) => Math.round((dia(b) - dia(a)) / 86400000)

// 40 dias de captação: 25 já rodados (hoje é o 26º) e 14 pela frente.
export const HOJE_ISO = HOJE
export const INICIO = somaDias(HOJE, -25)
export const FIM_CAPTACAO = somaDias(HOJE, 14)
export const EVENTO = somaDias(HOJE, 13)
export const FIM_TESTES = somaDias(HOJE, -20) // os 5 primeiros dias são teste

/** Todos os dias COM dado — do início da captação até hoje. */
export function diasComDado() {
  const out = []
  for (let i = 0; i <= diffDias(INICIO, HOJE); i++) out.push(somaDias(INICIO, i))
  return out
}

// --------------------------------------------------------------------
// Metas fictícias. Escolhidas para o painel contar uma história legível:
// o lançamento está levemente ATRÁS do ritmo em leads e investimento, o
// CPL passou pouco do alvo, e as páginas divergem bastante entre si — que
// é o cenário em que a escala de cores da tabela de páginas serve pra algo.
// --------------------------------------------------------------------
export const METAS = {
  leads: 24000,
  orcamentoCaptacao: 285000,
  cplDesejado: 11.5,
  cplLimite: 15,
  cpmMax: 40,
  ctrMin: 0.0115,
  connectRateMin: 0.82,
  convPaginaMin: 0.42,
  ingressoGrupoMin: 0.75,
  pctMql: 0.55,
  pctMqlGrupo: 0.8,
  taxaPesquisa: 0.5,
  wbTxAcesso: 0.45,
  faturamentoMin: 940000,
  cpc: 3,
}

export const SEGMENTOS = ['advogado', 'contador', 'outro']
