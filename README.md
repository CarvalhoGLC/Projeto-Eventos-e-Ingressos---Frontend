# Bilheteria — Front-end

Front-end em React + Vite para o [Sistema de Eventos e Ingressos](../backend),
com tema visual de bilheteria física: ingressos com canhoto perfurado e
carimbo de validação na portaria.

## Stack

- React 18 + Vite
- React Router (rotas separadas por página/papel)
- Tailwind CSS (paleta customizada — veja `tailwind.config.js`)
- lucide-react (ícones)

## Instalação

```bash
npm install
```

## Configuração

Copie o `.env.example` para `.env` e ajuste a URL da API se necessário:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Rodando

```bash
npm run dev
```

Abre em `http://localhost:5173`.

> ⚠️ **Pré-requisito**: o back-end (`fastapi dev backend_events_tickets/main.py`)
> precisa estar rodando e com o CORS liberado para a origem do front-end
> (já configurado no `main.py` do projeto com `allow_origins=["*"]`).

## Estrutura

```
src/
├── api.js                  # camada de acesso à API (fetch + endpoints)
├── context/AuthContext.jsx   # sessão (login/logout, restaura via /me)
├── components/
│   ├── ui.jsx                  # inputs, botões, banners, tabs
│   ├── TicketStub.jsx            # canhoto de ingresso (elemento-assinatura)
│   └── StampResult.jsx             # carimbo de validação da portaria
├── layout/AppLayout.jsx        # barra superior + navegação por papel
├── pages/
│   ├── LoginPage.jsx              # guichê (login/cadastro)
│   ├── OrganizerPage.jsx            # criar evento + busca TMDb
│   ├── ClientPage.jsx                 # reservar ingresso
│   ├── GatePage.jsx                     # validar entrada
│   └── ShareLookupPage.jsx                # consulta pública por link
└── App.jsx                    # rotas e proteção por papel
```

## Papéis e rotas

| Papel | Rota inicial | Pode acessar |
|---|---|---|
| `organizer` | `/organizer` | Criar Evento, Consultar Ingresso |
| `client` | `/client` | Reservar Ingresso, Consultar Ingresso |
| `gate` | `/gate` | Validar Entrada, Consultar Ingresso |

Tentar acessar a rota de outro papel redireciona automaticamente para a
página inicial do papel logado.

## Build de produção

```bash
npm run build
npm run preview
```

## Limitações conhecidas

- Não existe endpoint de listagem de eventos na API — a lista de eventos na
  tela do organizador é apenas local (desta sessão do navegador), útil para
  anotar os IDs.
- O QR Code é representado pelo payload assinado (texto), não por uma
  imagem escaneável de verdade — não há geração de imagem QR no front-end.
