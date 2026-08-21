# Frontend - Sistema de Eventos e Ingressos

Interface web responsiva e interativa para gestão de eventos, reserva/compra de bilhetes, compartilhamento e validação de ingressos na portaria via QR Code.

Construída com **React**, **Vite** e **Tailwind CSS**, consumindo a API REST em FastAPI e oferecendo controle de acesso baseado em papéis (RBAC) com suporte a contêineres **Docker / Nginx**.

---

## Índice

* [Funcionalidades](#funcionalidades)
* [Stack técnica](#stack-técnica)
* [Estrutura do projeto](#estrutura-do-projeto)
* [Pré-requisitos](#pré-requisitos)
* [Instalação](#instalação)
* [Configuração (.env)](#configuração-env)
* [Rodando o projeto](#rodando-o-projeto)
* [Páginas e Fluxos de Uso](#páginas-e-fluxos-de-uso)
* [Integração com a API](#integração-com-a-api)
* [Rodando com Docker](#rodando-com-docker)
* [Deploy na Vercel](#deploy-na-vercel)
* [Problemas comuns](#problemas-comuns)
* [Notas técnicas e decisões de projeto](#notas-técnicas-e-decisões-de-projeto)

---

## Funcionalidades

* **Autenticação e RBAC no Client-Side**: Contexto global de autenticação (`AuthContext`) que armazena os tokens JWT e altera a navegação baseada nos papéis (`organizer`, `client`, `gate`).
* **Painel do Organizador (`OrganizerPage`)**: Interface dedicada para cadastro e listagem de eventos.
* **Catálogo e Reserva do Cliente (`ClientPage`)**: Visualização de eventos disponíveis, seleção de assentos, simulação de pagamento e geração do bilhete.
* **Validação na Portaria (`GatePage`)**: Leitor/validador de ingressos que exibe respostas visuais em tempo real (`StampResult`) sobre a validade do ingresso (Liberado, Já Usado ou Inválido).
* **Bilhete Digital (`TicketStub`)**: Visualização estilizada do ingresso com exibição do QR Code assinado.
* **Consulta Pública de Ingressos (`ShareLookupPage`)**: Visualização de ingressos compartilhados por link público sem a necessidade de login.

---

## Stack técnica

| Camada | Tecnologia |
| --- | --- |
| Biblioteca Principal | React (18+) |
| Build Tool | Vite |
| Estilização | Tailwind CSS + PostCSS |
| Roteamento | React Router DOM |
| Gerenciamento de Estado | React Context API (`AuthContext`) |
| Servidor Web (Produção Docker) | Nginx |

---

## Estrutura do projeto

```
frontend/
├── Dockerfile                  # Build multi-stage (Node.js -> Nginx)
├── .dockerignore                 # Exclui node_modules, dist e .env da imagem
├── docker-compose.yml              # Configuração para subir o frontend em contêiner
├── nginx.conf                      # Configuração do Nginx com suporte a SPA (fallback index.html)
├── package.json                    # Dependências do projeto
├── postcss.config.js               # Configuração do PostCSS / Tailwind
├── tailwind.config.js              # Customização do tema Tailwind CSS
├── vite.config.js                  # Configurações do ambiente de build Vite
├── vercel.json                     # Configuração de reescrita de rotas para deploy na Vercel
├── .env                            # Variáveis de ambiente reais (não versionado)
├── .env.example                    # Modelo do .env para versionamento
└── src/
    ├── main.jsx                    # Ponto de entrada do React
    ├── App.jsx                     # Mapeamento das rotas e inicialização do layout
    ├── index.css                   # Diretivas globais do Tailwind CSS
    ├── api.js                      # Cliente HTTP / Configuração de chamadas para o backend
    ├── components/
    │   ├── StampResult.jsx         # Carimbo visual para status da validação na portaria
    │   ├── TicketStub.jsx          # Componente visual do bilhete de ingresso com QR Code
    │   └── ui.jsx                  # Componentes reutilizáveis de interface (botões, inputs)
    ├── context/
    │   └── AuthContext.jsx         # Estado global de sessão e funções de Login/Logout
    ├── layout/
    │   └── AppLayout.jsx           # Shell da aplicação (Navbar, estrutura geral)
    └── pages/
        ├── ClientPage.jsx          # Visão do cliente (Catálogo de eventos e reservas)
        ├── GatePage.jsx            # Visão da portaria (Leitor de QR Code / Validação)
        ├── LoginPage.jsx           # Tela de autenticação e seleção de papel
        ├── OrganizerPage.jsx       # Visão do organizador (Criação de novos eventos)
        └── ShareLookupPage.jsx     # Rota pública para visualização do ingresso via link

```

---

## Pré-requisitos

* **Node.js**: v18.0.0 ou superior
* **npm**: v9.0.0 ou superior (ou `yarn` / `pnpm`)

---

## Instalação

```bash
# 1. Entre no diretório do frontend
cd frontend

# 2. Instale as dependências
npm install

```

---

## Configuração (.env)

Crie um arquivo `.env` na raiz do diretório `frontend/`, copiando como base o modelo `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000

```

| Variável | Descrição |
| --- | --- |
| `VITE_API_BASE_URL` | Endereço base da API backend em FastAPI. Padrão local: `http://localhost:8000`. |

> ⚠️ **Atenção**: No Vite, todas as variáveis de ambiente expostas ao código do cliente devem obrigatoriamente iniciar com o prefixo `VITE_`.

---

## Rodando o projeto

De dentro da pasta `frontend`:

```bash
npm run dev

```

O servidor de desenvolvimento subirá por padrão no endereço `http://localhost:5173` (ou `http://localhost:3000`, conforme exibido no seu terminal).

---

## Páginas e Fluxos de Uso

1. **`LoginPage.jsx` (`/login`)**: O usuário insere e-mail e senha. O retorno do JWT define a sessão no `AuthContext` e redireciona automaticamente com base na role do usuário.
2. **`OrganizerPage.jsx` (`/organizer`)**: Exclusivo para papéis `organizer`. Formulário para registro de eventos (título, local, data, preço).
3. **`ClientPage.jsx` (`/client`)**: Exclusivo para papéis `client`. Lista eventos cadastrados, solicita a escolha do assento e executa a reserva. Exibe o ingresso gerado com o QR Code.
4. **`GatePage.jsx` (`/gate`)**: Exclusivo para o papel `gate`. Campo de leitura/validação para inserção da assinatura do QR Code. Exibe o componente `StampResult` com feedback imediato.
5. **`ShareLookupPage.jsx` (`/tickets/share/:token`)**: Acessível publicamente. Faz o consumo do endpoint sem necessidade de token de autenticação e exibe o bilhete estilizado (`TicketStub`).

---

## Integração com a API

O arquivo `src/api.js` centraliza os consumos HTTP para o backend.

* Insere automaticamente o cabeçalho `Authorization: Bearer <token>` nas requisições que exigem autenticação.
* Manipula as respostas de erro HTTP (ex: 401 Unauthorized, 400 Bad Request) e repassa os alertas para os componentes da interface.

---

## Rodando com Docker

O diretório traz uma estrutura preparada com build multi-etapas (*multi-stage build*) usando Node.js para compilar a aplicação estática e Nginx para servir os arquivos em produção.

### Opção 1 — Docker puro

```bash
# Build da imagem
docker build -t ingressos-frontend .

# Execução do contêiner na porta 3000
docker run -d -p 3000:80 ingressos-frontend

```

Acesse em seu navegador no endereço: `http://localhost:3000`

### Opção 2 — Docker Compose

```bash
docker compose up --build

```

---

## Deploy na Vercel

O arquivo `vercel.json` já está incluído na raiz do projeto para evitar erros de rotas não encontradas (404) ao recarregar telas no React Router DOM:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

```

Para publicar:

1. Conecte o repositório à **Vercel**.
2. Defina o **Root Directory** como `frontend`.
3. Adicione a variável de ambiente `VITE_API_BASE_URL` nas configurações do projeto na plataforma.

---

## Problemas comuns

### Erro de CORS ao tentar comunicar com a API

Confirme se o backend em FastAPI está rodando e se possui a configuração do middleware de CORS configurada para aceitar origens da porta onde o seu frontend está sendo executado (`http://localhost:5173` ou `http://localhost:3000`).

### Tela em branco ao recarregar a página (404 Not Found)

Se estiver rodando com o **Nginx**, garanta que o arquivo `nginx.conf` possui a instrução `try_files $uri $uri/ /index.html;`. Se estiver na **Vercel**, certifique-se de que o arquivo `vercel.json` está na raiz do projeto frontend.

### Erro `Failed to load PostCSS config: Unexpected token`

Verifique se o seu arquivo `postcss.config.js` está configurado corretamente com a sintaxe exigida pela versão do Tailwind utilizada no projeto (ex: `module.exports` para CommonJS ou `export default` caso o `package.json` use `"type": "module"`).

---

## Notas técnicas e decisões de projeto

* **Rotas Protegidas**: A navegação impede o acesso direto a rotas restritas por URL caso o usuário não possua o token ativo ou a role adequada gravada na sessão.
* **Servidor Nginx leve**: A imagem Docker final descarta o Node.js e mantêm unicamente a pasta `dist` rodando sobre o Alpine Nginx, reduzindo o consumo de memória e a superfície de segurança em produção.
* **Estilização modular**: O Tailwind CSS gerencia o layout e o padrão visual sem dependência de bibliotecas de componentes externas pesadas.