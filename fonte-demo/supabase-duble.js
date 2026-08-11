// =====================================================================
// DUBLÊ do cliente Supabase, usado SOMENTE no build de demonstração.
//
// O arquivo de produção cria um cliente real e carrega a URL do projeto e
// a chave anônima. Nenhuma das duas pode entrar num bundle público. Mesmo
// a anon key sendo protegida por RLS, publicar a URL do banco é convite
// para alguém testar as políticas.
//
// Este dublê tem a MESMA superfície (mesmos exports, mesmas assinaturas),
// então App.vue e Login.vue não precisam de nenhuma alteração. Ele apenas
// devolve uma sessão fictícia já autenticada e nunca toca na rede.
// =====================================================================

export const ALLOWED_DOMAIN = '@exemplo.br'
export const ALLOWED_EMAILS = []

export function emailPermitido() {
  return true
}

const USUARIO_DEMO = {
  id: 'demo-0000',
  email: 'visitante@exemplo.br',
  user_metadata: { name: 'Visitante' },
}
const SESSAO_DEMO = { user: USUARIO_DEMO, access_token: 'demo' }

export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: SESSAO_DEMO }, error: null }
    },
    async signInWithPassword() {
      return { data: { user: USUARIO_DEMO, session: SESSAO_DEMO }, error: null }
    },
    async signOut() {
      return { error: null }
    },
    // o App.vue registra um listener; devolvemos o formato que ele espera
    onAuthStateChange(cb) {
      setTimeout(() => cb('SIGNED_IN', SESSAO_DEMO), 0)
      return { data: { subscription: { unsubscribe() {} } } }
    },
  },
}

export function isAllowed() {
  return true
}
