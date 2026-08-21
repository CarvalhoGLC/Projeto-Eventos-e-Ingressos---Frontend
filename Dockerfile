# ---- Estágio 1: build ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# O Vite embute variáveis VITE_* no bundle final durante o build — não
# existe leitura em runtime, então isso precisa ser um argumento de build,
# não uma variável de ambiente do container em produção.
ARG VITE_API_BASE_URL=http://127.0.0.1:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Estágio 2: produção (serve os arquivos estáticos) ----
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]