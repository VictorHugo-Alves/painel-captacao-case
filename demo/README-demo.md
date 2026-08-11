# O que há nesta pasta

Build estático do painel real, com o back-end substituído por dados fictícios.

- `index.html` + `assets/` — o front de produção compilado, sem alteração de componente
- as chamadas `/api/*` são interceptadas por `demo-intercept.js` (na raiz do repo)
- os dados vêm de `demo-fixtures.js` (na raiz do repo)
- o cliente de banco foi trocado por `demo-supabase-stub.js`, para que nenhuma
  credencial ou URL de projeto entre no bundle

Nenhum valor corresponde a campanha, empresa ou pessoa real.
