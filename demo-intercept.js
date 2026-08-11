// =====================================================================
// Modo demonstração: intercepta window.fetch e responde /api/* a partir
// dos dados fictícios, sem back-end.
//
// Por que interceptar em vez de mexer nos 10 arquivos *-api.js: o front
// de produção fica idêntico ao que roda no dashboard real. Nenhuma linha
// dos componentes muda, então o que a demo mostra É o produto, não uma
// reprodução parecida.
// =====================================================================
import { FIXTURES, respostaPadrao } from './fixtures.js'

const original = window.fetch.bind(window)

window.fetch = async function (entrada, opcoes) {
  const url = typeof entrada === 'string' ? entrada : entrada?.url ?? ''

  if (!url.includes('/api/')) return original(entrada, opcoes)

  // /api/paginas/active?from=…&to=…  ->  /paginas/active
  const rota = url.split('/api')[1].split('?')[0].replace(/\/$/, '')
  const corpo = FIXTURES[rota] ?? respostaPadrao(rota)

  if (!(rota in FIXTURES)) {
    // visível no console para quem inspecionar: nada é silencioso
    console.info('[demo] rota sem dado fictício, devolvendo vazio:', rota)
  }

  // latência simbólica: sem ela a tela pinta antes do "carregando…" aparecer
  // e a demo fica menos parecida com o produto real.
  await new Promise((r) => setTimeout(r, 90 + Math.random() * 120))

  return new Response(JSON.stringify(corpo), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

console.info(
  '%c[demonstração]%c dados 100%% fictícios, gerados por src/demo/fixtures.js. ' +
  'Nenhum valor corresponde a campanha, empresa ou pessoa real.',
  'background:#2C5BD9;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700',
  'color:inherit',
)
