# Frontend — Sistema de Eventos e Ingressos

Interface web para gestão de eventos, reserva de ingressos, "Meus Ingressos"
e validação na portaria via QR Code (câmera ou digitação manual).

Construída com **React**, **Vite** e **Tailwind CSS**, consumindo a API REST
em FastAPI, com controle de acesso baseado em papéis (RBAC) e suporte a
contêineres **Docker / Nginx**.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack técnica](#stack-técnica)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração (.env)](#configuração-env)
- [Rodando o projeto](#rodando-o-projeto)
- [Papéis e rotas](#papéis-e-rotas)
- [Páginas e fluxos de uso](#páginas-e-fluxos-de-uso)
- [Integração com a API](#integração-com-a-api)
- [Rodando com Docker](#rodando-com-docker)
- [Deploy no Vercel](#deploy-no-vercel)
- [Problemas comuns](#problemas-comuns)
- [Notas técnicas e decisões de projeto](#notas-técnicas-e-decisões-de-projeto)

---

## Funcionalidades

- **Autenticação e RBAC no client-side**: `AuthContext` guarda o JWT e o
  papel do usuário (`organizer`, `client`, `gate`), redirecionando
  automaticamente conforme a permissão. Suporta "lembrar de mim"
  (sessão persiste em `localStorage`) ou sessão só da aba atual
  (`sessionStorage`).
- **Navegação e busca de eventos**: lista todos os eventos publicados com
  título, local, data e preço, com campo de busca por título/local.
- **Criação e gerenciamento de eventos (Organizador)**: cria, edita
  (inline) e exclui os próprios eventos. A exclusão é bloqueada pelo
  backend se o evento já tiver ingressos vendidos.
- **Reserva de ingressos (Cliente)**: dois modos de seleção — **mapa de
  assentos** (grade clicável, multi-seleção) ou **quantidade** (tipo
  pista/show), com pagamento simulado (confirmação ou recusa).
- **"Meus Ingressos" (Cliente)**: histórico completo dos ingressos já
  reservados, com status (`Válido` / `Já validado`) e o payload do QR
  Code de cada um.
- **Consulta pública de ingresso por link/token**: qualquer pessoa com o
  link pode ver os dados de um ingresso específico, sem login.
- **Validação na portaria (Gate)**: leitura do QR Code **pela câmera**
  (via `html5-qrcode`) com **digitação manual como alternativa**; retorno
  visual em forma de carimbo — `Válido`, `Já usado`, `Inválido` ou
  `Evento errado`.
- **Bilhete digital estilizado (`TicketStub`)**: visual de canhoto de
  ingresso com o payload do QR Code.

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Biblioteca principal | React 18 |
| Build tool | Vite |
| Estilização | Tailwind CSS + PostCSS |
| Roteamento | React Router DOM |
| Estado de sessão | React Context API (`AuthContext`) |
| Leitura de QR pela câmera | `html5-qrcode` |
| Ícones | `lucide-react` |
| Servidor web (produção Docker) | Nginx |

---

## Estrutura do projeto

```
frontend/
├── Dockerfile                  # Build multi-stage (Node.js -> Nginx)
├── .dockerignore
├── docker-compose.yml
├── nginx.conf                    # SPA fallback (try_files ... /index.html)
├── vercel.json                     # Rewrite de rotas para deploy na Vercel
├── package.json
├── postcss.config.js / .cjs
├── tailwind.config.js / .cjs
├── vite.config.js
├── .env                             # Variáveis reais (não versionado)
├── .env.example
├── public/
│   └── login-bg.avif                  # Foto de fundo da tela de login
└── src/
    ├── main.jsx                         # Ponto de entrada do React
    ├── App.jsx                            # Rotas e proteção por papel
    ├── index.css                            # Diretivas globais do Tailwind
    ├── api.js                                 # Cliente HTTP para o backend
    ├── components/
    │   ├── StampResult.jsx                      # Carimbo de validação da portaria
    │   ├── TicketStub.jsx                          # Canhoto do ingresso com QR
    │   └── ui.jsx                                     # Inputs, botões, banners, tabs
    ├── context/
    │   └── AuthContext.jsx                              # Sessão, login/logout, "lembrar de mim"
    ├── layout/
    │   └── AppLayout.jsx                                    # Barra superior + navegação por papel
    └── pages/
        ├── LoginPage.jsx                                        # Login/cadastro (guichê)
        ├── OrganizerPage.jsx                                        # Criar/editar/excluir eventos
        ├── ClientPage.jsx                                              # Reservar, Meus Ingressos, Consultar
        ├── GatePage.jsx                                                  # Validação (câmera + manual)
        └── ShareLookupPage.jsx                                              # Navegação/busca de eventos
```

---

## Pré-requisitos

- **Node.js**: v18 ou superior
- **npm**: v9 ou superior

---

## Instalação

```bash
cd frontend
npm install
```

---

## Configuração (.env)

Copie o `.env.example` para `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

| Variável | Descrição |
|---|---|
| `VITE_API_BASE_URL` | URL base da API FastAPI. |

> ⚠️ No Vite, toda variável exposta ao código do cliente precisa começar
> com `VITE_`. Em produção (Vercel/Docker), essa variável é lida **no
> momento do build** — trocar o valor depois exige rebuild.

---

## Rodando o projeto

```bash
npm run dev
```

Abre em `http://localhost:5173`.

---

## Papéis e rotas

| Papel | Rota inicial | Acesso |
|---|---|---|
| `organizer` | `/organizer` | Criar/editar/excluir eventos, Consultar Eventos |
| `client` | `/client` | Reservar, Meus Ingressos, Consultar Ingresso, Consultar Eventos |
| `gate` | `/gate` | Validar Entrada, Consultar Eventos |

Tentar acessar a rota de outro papel redireciona automaticamente para a
página inicial do papel logado.

---

## Páginas e fluxos de uso

### `LoginPage` (`/login`)
Login e cadastro. Checkbox "Lembrar de mim" decide se a sessão sobrevive
ao fechar o navegador (`localStorage`) ou só dura a aba atual
(`sessionStorage`).

### `OrganizerPage` (`/organizer`)
- Formulário de criação de evento (com busca opcional no TMDb para
  sugerir título).
- Lista **persistente** dos próprios eventos (busca em `GET /events` e
  filtra pelo `organizer_id` do usuário logado).
- Cada evento tem **Editar** (formulário inline) e **Excluir** (com
  confirmação). Excluir um evento com ingressos vendidos retorna erro do
  backend, exibido no banner.

### `ClientPage` (`/client`)
Três abas:
1. **Reservar Ingresso** — escolhe o evento (dropdown carregado da API),
   depois alterna entre **Mapa de assentos** (grade A1–E8, clique para
   selecionar múltiplos) ou **Quantidade** (campo numérico, gera
   ingressos "pista" com identificador único). Checkbox de pagamento
   simulado. Reserva múltiplos assentos/ingressos em sequência (uma
   chamada por assento) e mostra o resultado de cada um.
2. **Meus Ingressos** — histórico completo (`GET /bookings/me`), com
   status (`Válido` / `Já validado`) e o QR Code de cada ingresso.
3. **Consultar Ingresso** — busca por link/token compartilhável.

### `GatePage` (`/gate`)
Seleciona o evento, depois valida por **câmera** (botão liga o leitor
`html5-qrcode`, decodifica e valida automaticamente) ou por **digitação
manual** do payload, como alternativa. Resultado em carimbo animado.

### `ShareLookupPage` (`/share`)
Lista todos os eventos publicados (título, local, data, preço) com campo
de busca por título/local, filtrando a lista já carregada no cliente.

---

## Integração com a API

`src/api.js` centraliza todas as chamadas HTTP:

| Função | Endpoint |
|---|---|
| `register` | `POST /register` |
| `login` | `POST /token` |
| `me` | `GET /me` |
| `getEvents` | `GET /events` |
| `createEvent` | `POST /events` |
| `updateEvent` | `PUT /events/{id}` |
| `deleteEvent` | `DELETE /events/{id}` |
| `bookTicket` | `POST /bookings` |
| `myTickets` | `GET /bookings/me` |
| `sharedTicket` | `GET /tickets/share/{token}` |
| `searchMovies` | `GET /external/movies` |
| `validateGate` | `POST /gate/validate` |

O header `Authorization: Bearer <token>` é adicionado automaticamente
quando um `token` é passado para a função de requisição. Erros HTTP viram
`Error` com a mensagem do campo `detail` (padrão do FastAPI).

---

## Rodando com Docker

Build multi-stage: Node.js compila os arquivos estáticos, Nginx serve em
produção.

### Docker puro

```bash
docker build -t bilheteria-frontend \
  --build-arg VITE_API_BASE_URL=https://seu-backend.exemplo.com .
docker run -d -p 3000:80 bilheteria-frontend
```

Acesse `http://localhost:3000`.

### Docker Compose

Crie um `.env` na raiz (lido pelo `docker-compose.yml`):

```env
VITE_API_BASE_URL=https://seu-backend.exemplo.com
```

```bash
docker compose up --build
```

> A `VITE_API_BASE_URL` é embutida no bundle **no build**, não em
> runtime. Mudou a URL? Precisa rebuildar (`--build-arg` ou `.env` +
> `docker compose up --build` de novo).

---

## Deploy no Vercel

O `vercel.json` já inclui o rewrite necessário para o React Router
funcionar em qualquer rota (sem ele, dar refresh em `/client`, `/gate`
etc. retorna 404).

1. **Add New → Project**, importe o repositório (defina o **Root
   Directory** se o front estiver em subpasta de um monorepo).
2. Framework detectado automaticamente como **Vite**.
3. Em **Environment Variables**, adicione `VITE_API_BASE_URL` apontando
   para a URL do backend publicado.
4. Deploy. Se adicionar/alterar a variável depois do primeiro deploy, é
   preciso um **Redeploy** manual — variáveis não retroagem em builds já
   feitos.

O backend já está com CORS liberado (`allow_origins=["*"]`), então
qualquer domínio do Vercel (incluindo URLs de preview) funciona sem
configuração extra.

---

## Problemas comuns

### Erro de CORS
Confirme que o backend está rodando e com o middleware de CORS liberando
a origem do frontend.

### Tela em branco ao recarregar a página (404)
No Nginx, confirme `try_files $uri $uri/ /index.html;` no `nginx.conf`.
Na Vercel, confirme que o `vercel.json` está na raiz do projeto.

### `Failed to load PostCSS config: Unexpected token`
Geralmente é conflito entre `.js` e `.cjs` coexistindo, ou `"type":
"module"` do `package.json` divergindo da sintaxe do arquivo. Prefira
`postcss.config.cjs` / `tailwind.config.cjs` com `module.exports` — funciona
independentemente do `"type"` do `package.json`.

### Câmera não abre no `GatePage`
Navegadores só liberam câmera em contexto seguro (`https://` ou
`localhost`). Em produção, confirme que o domínio está em HTTPS. Também
vale conferir se o navegador não bloqueou a permissão de câmera para o
site.

### Evento não aparece para reserva/validação logo após ser criado
`OrganizerPage`, `ClientPage` e `GatePage` carregam a lista de eventos
uma vez ao montar a tela. Se você criou o evento em outra aba/sessão,
recarregue a página para buscar a lista atualizada.

---

## Notas técnicas e decisões de projeto

- **Rotas protegidas por papel**: acesso direto por URL a uma rota de
  outro papel redireciona para a home do papel logado, sem expor a tela.
- **Sem checagem prévia de disponibilidade de assento**: o mapa de
  assentos não sabe quais já foram vendidos (o backend não expõe esse
  endpoint) — o erro de "assento já vendido" só aparece ao confirmar a
  reserva, não antes.
- **Ingressos "pista"**: quando reservados por quantidade, cada ingresso
  recebe um identificador único gerado no cliente (`PISTA-XXXXXXXX`),
  já que o backend exige um `seat_number` distinto por ingresso.
- **QR Code como payload de texto**: o "QR Code" exibido é o payload
  assinado (texto), não uma imagem escaneável gerada no frontend — quem
  lê de verdade é a câmera na tela da portaria, apontada para o QR físico
  do ingresso (impresso ou gerado em outro sistema a partir desse
  payload).
- **Exclusão de evento com ingressos vendidos**: bloqueada pelo backend
  (retorna erro tratado), para não deixar tickets órfãos.
- **Servidor Nginx leve em produção**: a imagem Docker final descarta o
  Node.js, mantendo só a pasta `dist` sobre Nginx Alpine.