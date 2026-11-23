FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# финальный образ
FROM node:22-alpine AS runner
WORKDIR /app

# Копируем зависимости из первого этапа
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Открываем порт
EXPOSE 3000

# Запускаем миграции и сервер
CMD ["sh", "-c", "npx prisma migrate deploy && node --env-file=.env src/server.js"]
