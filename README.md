# Hackathon Platform API

REST API для платформы организации хакатонов. Позволяет создавать хакатоны, регистрировать команды, приглашать участников, загружать проекты, оценивать их по критериям и формировать лидерборд.

## Стек технологий

- **Node.js 22** (ESM)
- **Express 5** — веб-фреймворк
- **Prisma 7** — ORM для PostgreSQL
- **PostgreSQL 16** — база данных
- **JWT** — аутентификация
- **bcryptjs** — хеширование паролей
- **Zod** — валидация входных данных
- **Swagger** — документация API
- **Docker / Docker Compose** — контейнеризация 

## Предварительные требования для старта

- Установленный Docker и Docker Compose
- Свободные порты 3000 (приложение) и 5433 (PostgreSQL)

## Запуск

1. **Склонируйте репозиторий:**
   ```bash
   git clone <URL>
   cd hackathon-platform

2. **Создайте файл .env (пример)**
   ```bash
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/hackathon?schema=public
   JWT_SECRET=super_secret_key_change_me_in_production
   JWT_EXPIRES_IN=7d
   BCRYPT_ROUNDS=10

PORT	        Порт, на котором запускается сервер
DATABASE_URL	Строка подключения к PostgreSQL (для локального запуска без Docker)
JWT_SECRET	Секретный ключ для подписи JWT
JWT_EXPIRES_IN	Время жизни JWT-токена
BCRYPT_ROUNDS	Количество раундов хеширования bcrypt

**Важно**: при запуске через docker-compose строка DATABASE_URL переопределяется внутри контейнера 
(см. docker-compose.yml), так как приложение обращается к базе по имени сервиса db, а не через localhost

3. **Запустите приложение**
   ```bash
   docker-compose up --build

4. **Проверьте работу**

- API доступно по адресу: http://localhost:3000
- Swagger-документация: http://localhost:3000/docs
- Health-check: http://localhost:3000/health

5. **Остановка**
   ```bash
   docker-compose down

## Эндпоинты
### Аутентификация
- POST	/api/auth/register   Регистрация пользователя	    Доступ: Публичный
- POST	/api/auth/login	     Вход, получение JWT	    Доступ: Публичный
- GET	/api/auth/me	     Данные текущего пользователя   Доступ: Авторизованный

### Хакатоны
- GET	/api/hackathons	      Список хакатонов	Доступ: Авторизованный
- GET	/api/hackathons/:id   Хакатон по ID	Доступ: Авторизованный
- POST	/api/hackathons	      Создать хакатон	Доступ: ADMIN
- PATCH	/api/hackathons/:id   Обновить хакатон 	Доступ: ADMIN

### Критерии
- GET	 /api/hackathons/:hackathonId/criteria	    Список критериев хакатона	Авторизованный
- POST	 /api/hackathons/:hackathonId/criteria	    Создать критерий	        ADMIN
- PATCH	 /api/hackathons/:hackathonId/criteria/:id  Обновить критерий	        ADMIN
- DELETE /api/hackathons/:hackathonId/criteria/:id  Удалить критерий	        ADMIN

### Команды
- GET	/api/hackathons/:hackathonId/teams  Список команд хакатона	           Авторизованный
- POST	/api/hackathons/:hackathonId/teams  Создать команду (создатель — капитан)  Авторизованный
- GET	/api/teams/:id	                    Команда по ID	                   Авторизованный
- POST	/api/teams/:id/invitations	    Пригласить участника по email	   Капитан
- POST	/api/invitations/:id/accept	    Принять приглашение	                   Приглашенный

### Проекты
- POST	/api/teams/:teamId/project  Засабмитить проект (минимум 2 участника)	Капитан
- GET	/api/projects/:id	    Проект по ID	                        Авторизованный
- PATCH	/api/projects/:id	    Обновить проект	                        Капитан

### Оценки
- POST	/api/projects/:projectId/grades	Поставить оценку по критерию	JUDGE (назначенный на хакатон)
- GET	/api/projects/:projectId/grades	Оценки проекта	                JUDGE / ADMIN (с ограничениями до завершения)

### Лидерборд
- GET	/api/hackathons/:hackathonId/leaderboard  Лидерборд  Доступ: Авторизованный

## Бизнес-правила
- Команда не может засабмитить проект, если в ней менее 2 участников со статусом ACCEPTED. Проверка выполняется в project.service.js.
- Каждый судья оценивает проект по всем критериям. Повторное оценивание по тому же критерию запрещено (защита на уровне БД через @@unique([projectId, judgeId, criterionId]) и на уровне сервиса).
- Оценка не может превышать maxScore критерия. Проверка в grade.service.js.
- Судья должен быть назначен на хакатон. Проверка через таблицу HackathonJudge.
- Лидерборд доступен только после завершения хакатона. Проверяются и статус FINISHED, и дата окончания (now > endDate).
- Итоговый балл — сумма средних баллов по каждому критерию (среднее по судьям, поставившим оценку). В ответе раскрываются оценки каждого судьи по каждому критерию.

## Структура проекта
src/
├── config/
│   └── swagger.js           # Конфигурация Swagger
├── middlewares/
│   ├── auth.js              # Проверка JWT
│   ├── role.js              # Проверка роли
│   └── errorHandler.js      # Глобальный обработчик ошибок
├── modules/
│   ├── auth/                # Регистрация, логин, /me
│   ├── hackathons/          # CRUD хакатонов
│   ├── criteria/            # Критерии оценивания
│   ├── teams/               # Команды и приглашения
│   ├── projects/            # Проекты
│   ├── grades/              # Оценки жюри
│   └── leaderboard/         # Лидерборд
├── prisma.js                # Инициализация Prisma Client
└── server.js                # Точка входа

## Примеры запросов
- Регистрация 
 ```bash
 curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"secret123"}'

- Логин
 ```bash
 curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'

- Создание хакатона
 ```bash
 curl -X POST http://localhost:3000/api/hackathons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"AI Hackathon","theme":"AI","startDate":"2025-12-01T10:00:00.000Z","endDate":"2025-12-03T18:00:00.000Z"}'
