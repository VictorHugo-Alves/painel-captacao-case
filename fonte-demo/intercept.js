// =====================================================================
// Modo demonstração: intercepta window.fetch e responde /api/* a partir
// dos dados fictícios, sem back-end.
//
// Por que interceptar em vez de mexer nos arquivos *-api.js: o front fica
// idêntico ao que roda no painel real. Nenhuma linha dos componentes muda,
// então o que a demo mostra É o produto, não uma reprodução parecida.
//
// Os parâmetros da URL (from, to, utm) são repassados aos geradores, então
// os filtros da barra superior funcionam de verdade: recortam a série e
// tudo que deriva dela, exatamente como o back-end faria.
// =====================================================================
import { resolver, respostaPadrao } from './fixtures.js'

const original = window.fetch.bind(window)

window.fetch = async function (entrada, opcoes) {
  const url = typeof entrada === 'string' ? entrada : entrada?.url ?? ''

  if (!url.includes('/api/')) return original(entrada, opcoes)

  // /api/paginas/active?from=…&to=…  ->  rota + params
  const [caminho, busca = ''] = url.split('/api')[1].split('?')
  const rota = caminho.replace(/\/$/, '')
  const q = new URLSearchParams(busca)
  const params = {
    from: q.get('from') || null,
    to: q.get('to') || null,
    utm: q.get('utm') || null,
  }

  let corpo = resolver(rota, params)
  if (corpo === undefined) {
    // visível no console para quem inspecionar: nada é silencioso
    console.info('[demo] rota sem dado fictício, devolvendo vazio:', rota)
    corpo = respostaPadrao(rota)
  }

  // latência simbólica: sem ela a tela pinta antes do "carregando…" aparecer
  // e a demo fica menos parecida com o produto real.
  await new Promise((r) => setTimeout(r, 70 + Math.random() * 110))

  return new Response(JSON.stringify(corpo), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

console.info(
  '%c[demonstração]%c dados 100%% fictícios, gerados por src/demo/fixtures.js. ' +
  'Nenhum valor corresponde a campanha, empresa ou pessoa real. ' +
  'As metas exibidas também são inventadas para esta demo.',
  'background:#2C5BD9;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700',
  'color:inherit',
)
