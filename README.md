# Voidex — Онлайн-кинотеатр

> Полная техническая документация проекта: текущая реализация, архитектура и дорожная карта до production-уровня.
>
> Автор: RyFeRof · Репозиторий: `flexora-cinema`

---

## Оглавление

1. [О проекте](#1-о-проекте)
2. [Технологический стек](#2-технологический-стек)
3. [Текущее состояние реализации](#3-текущее-состояние-реализации)
4. [Архитектура системы](#4-архитектура-системы)
5. [Схема базы данных](#5-схема-базы-данных)
6. [Фаза 0 — Фундамент](#6-фаза-0--фундамент)
7. [Фаза 1 — Рекомендательная система](#7-фаза-1--рекомендательная-система)
8. [Фаза 2 — Поиск через триграммы](#8-фаза-2--поиск-через-триграммы)
9. [Фаза 3 — Видеоплеер, HLS и защита контента](#9-фаза-3--видеоплеер-hls-и-защита-контента)
10. [Фаза 3.5 — Субтитры](#10-фаза-35--субтитры)
11. [Фаза 4 — Подписки и семейный доступ](#11-фаза-4--подписки-и-семейный-доступ)
12. [Фаза 5 — Email-верификация](#12-фаза-5--email-верификация)
13. [Фаза 6 — Совместный просмотр через WebSocket](#13-фаза-6--совместный-просмотр-через-websocket)
14. [Фаза 7 — Адаптивность и мобильная версия](#14-фаза-7--адаптивность-и-мобильная-версия)
15. [Фаза 8 — Финальная полировка](#15-фаза-8--финальная-полировка)
16. [Сводная таблица API-эндпоинтов](#16-сводная-таблица-api-эндпоинтов)
17. [Оценка трудозатрат и сроков](#17-оценка-трудозатрат-и-сроков)
18. [Риски и компромиссы](#18-риски-и-компромиссы)
19. [Чек-лист готовности к собеседованиям](#19-чек-лист-готовности-к-собеседованиям)

---

## 1. О проекте

Voidex (рабочее название репозитория — `flexora-cinema`) — это онлайн-кинотеатр полного цикла, разрабатываемый как pet-проект с явной целью: довести его до уровня, который выступит весомым аргументом при трудоустройстве на позицию Middle Backend / Fullstack Developer.

Ключевая идея проекта — не просто CRUD над таблицей фильмов, а сервис с инженерно сложными частями, которые редко встречаются в типичных учебных проектах:

- собственная рекомендательная система с тремя независимыми слоями (SQL-правила, content-based через векторные embeddings, collaborative filtering через матричную факторизацию с обучением методом SGD);
- видеоплеер с адаптивным стримингом (HLS) и защитой контента от прямого скачивания;
- совместный просмотр в реальном времени через WebSocket;
- полноценный auth-flow с refresh-токенами, email-верификацией;
- модель подписок с поддержкой семейного доступа по промокодам;
- полнотекстовый/нечёткий поиск через PostgreSQL trigram-индексы;
- production-инфраструктура: CI/CD, тесты, Swagger-документация, graceful shutdown, версионируемые миграции.

Документ описывает: что уже реализовано на момент написания, полную архитектуру каждого крупного блока и подробный план разработки оставшихся частей — вплоть до структуры таблиц, эндпоинтов и конкретных технических решений по каждой фиче.

---

## 2. Технологический стек

### Backend

| Компонент | Технология | Статус |
|---|---|---|
| Язык | Go | ✅ используется |
| HTTP-роутинг | стандартный `net/http` (`http.ServeMux`, Go 1.22+ паттерны маршрутов) | ✅ используется |
| База данных | PostgreSQL | ✅ используется |
| Драйвер БД | `pgx/v5` (`pgxpool`) | ✅ используется |
| Векторный поиск | pgvector | ✅ используется (расширение подключено, колонка `embedding vector(3072)` в `Films`) |
| Кеш | in-memory кеш справочников (жанры/страны/роли) в `cache/` | ✅ используется (заготовка под будущий вынос в Redis) |
| Кеш | Redis (`go-redis/v9`) | ⏳ планируется (пакет уже в `go.mod`, интеграция не начата) |
| Аутентификация | JWT (access + refresh), кастомная реализация | ✅ используется |
| Embeddings | Gemini API (`google.golang.org/genai`, модель `gemini-embedding-001`) | ✅ используется (вызывается при создании фильма, вектор пишется в БД) |
| Email | Resend API | ⏳ планируется |
| Real-time | `gorilla/websocket` | ⏳ планируется (пакет в зависимостях, использование не начато) |
| Видео-обработка | `ffmpeg` (конвертация в HLS, нарезка сегментов) | ⏳ планируется |
| Миграции | `golang-migrate` | ✅ используется (файлы в `migrations/`, накатываются в `db.Init()` при старте) |
| Документация API | `swaggo/swag` | ⏳ планируется |
| Тестирование | `testing` + `testify` + `testcontainers-go` | ⏳ планируется |

### Frontend

| Компонент | Технология | Статус |
|---|---|---|
| Фреймворк | React + TypeScript | ✅ используется |
| Сборщик | Vite | ✅ используется |
| Стилизация | Tailwind CSS | ✅ используется |
| Роутинг | `react-router-dom` | ✅ используется |
| HTTP-клиент | `axios` | ✅ используется |
| Видеоплеер | нативный `<video>` → `hls.js` (план) | ⏳ заглушка (страница-плейсхолдер на 2 строки) |
| State для auth | React Context (`authContext`) | ✅ используется |

### Инфраструктура

| Компонент | Технология | Статус |
|---|---|---|
| Контейнеризация | Docker, `docker-compose` | ✅ используется (базовая конфигурация) |
| CI/CD | GitHub Actions | ⏳ планируется |
| Хранилище файлов | локальная файловая система (`/uploads`) | ✅ используется (план — пересмотреть на объектное хранилище при росте) |

---

## 3. Текущее состояние реализации

Этот раздел фиксирует точный срез того, что есть в коде репозитория `flexora-cinema` на момент написания документа — чтобы у любого читающего (включая будущего себя и интервьюера) было честное понимание прогресса.

### 3.1 Backend — что реализовано

**Структура проекта** организована по слоям: `handlers` → `service` → `repository`, что само по себе хороший архитектурный сигнал — бизнес-логика отделена от HTTP-слоя и от прямых SQL-запросов, что упрощает unit-тестирование и последующую замену любого слоя.

```
back-end/
├── cache/          — in-memory кеш справочников (жанры/страны/роли), потокобезопасный (sync.RWMutex)
├── db/             — инициализация пула соединений + запуск golang-migrate миграций
├── gemini/         — клиент Gemini API, получение embedding по тексту
├── handlers/       — HTTP-хендлеры (тонкий слой, парсинг запроса/ответа)
├── jwtContext/     — управление JWT (генерация, парсинг, claims)
├── middleware/      — auth-мидлварь, CORS
├── migrations/     — версионируемые SQL-миграции (up/down) под golang-migrate
├── models/         — структуры данных (User, Film, Release, Trailer, Card, Logo, ...)
├── repository/     — слой прямых SQL-запросов к БД
├── route/          — регистрация маршрутов
├── service/        — бизнес-логика
└── uploads/         — загруженные медиафайлы (трейлеры, карточки, логотипы)
```

**Реализованные возможности:**

- **Регистрация и вход** (`POST /api/auth/register`, `POST /api/auth/login`) — хеширование паролей, выдача пары access/refresh токенов.
- **JWT-аутентификация** с разделением типов токенов (`TokenTypeAccess`/`TokenTypeRefresh`), хранением refresh-токенов в таблице `RefreshJwtTokens` с полями `jti`, `deviceId`, `revoked`, `expired_time` — это даёт возможность отзыва токенов и привязки к устройству, что заметно превышает уровень типичного учебного auth.
- **Обновление токена** (`POST /api/auth/refresh`).
- **CRUD фильмов**: добавление (`POST /api/films`), получение списка с пагинацией через `limit`/`lastId` (`GET /api/films`), получение релиза по id с поддержкой сезона/серии (`GET /api/films/{id}?season=&seria=`).
- **CRUD справочников**: жанры, страны, роли (`GET/POST /api/films/genres`, `/countries`, `/roles`) — заготовки под будущий полноценный раздел справочников в админке (п. 15.1).
- **Участники съёмок**: поиск по имени (`GET /api/films/filming-members/search`), добавление (`POST /api/films/filming-members`).
- **In-memory кеш справочников** (`cache/RefCache`) — жанры/страны/роли грузятся в память при старте и резолвятся по id без похода в БД на каждый запрос; предусмотрен метод `Regenerate` для пересборки.
- **Content-based фундамент рекомендательной системы**: при создании фильма (`AddProject`) собирается текстовое описание (название + описание + жанры + страны + участники с ролями), отправляется в Gemini API (`gemini-embedding-001`), полученный вектор (3072 числа) пишется в колонку `Films.embedding` (`pgvector`). Это реализует пункт 7.6 и часть пункта 7.10 плана Фазы 1 — раньше, чем остальные шаги того же плана.
- **Валидация таймкодов интро/аутро** (`validateTimeline`) при создании релиза — часть задела под кнопку "пропустить заставку".
- **Загрузка файлов** (`POST /api/films/upload`) — трейлеры, карточки (с флагом горизонтальная/вертикальная), логотипы.
- **Раздача статики** через `/uploads/`.
- **Auth-мидлварь** — проверка `Authorization: Bearer`, валидация типа токена.
- **Версионируемые миграции через `golang-migrate`** — `migrations/0001_init` (базовая схема) → `0002_recSystem` (таблицы под рекомендательную систему: `shelves`, `user_recomendations`, `user_events`, `user_factors`, `movie_factors`, расширение `pgvector`) → `0003_recSystem` (доработки схемы: `premiere_date`, снятие дефолта у `dateCreate`, глобальные рекомендации без привязки к юзеру). Пункт 6.1 Фазы 0 **закрыт**.
- **Graceful shutdown** — `signal.NotifyContext` + `srv.Shutdown` с таймаутом 10с + закрытие пула БД, реализовано ровно по шаблону из раздела 6.2. Плюс фоновый тикер раз в час, чистящий протухшие refresh-токены (`repository.DeleteExpired`). Пункт 6.2 Фазы 0 **закрыт**.

### 3.2 База данных — что реализовано

Схема уже содержит заметно больше таблиц, чем задействовано в API — это заготовки под будущий функционал, спроектированные заранее:

- `Films`, `Trailers`, `FilmCards`, `Logos`, `FilmLogos` — карточки фильмов и медиа.
- `Countries`, `FilmCountries`, `Genres`, `FilmGenres` — классификация.
- `FilmingMembers`, `Roles`, `FilmFilmingMembers` — актёры/режиссёры/роли (универсальная схема many-to-many с типом роли).
- `Materials`, `Seasons`, `Releases` — структура сериалов: фильм → сезон → релиз (серия), с полями таймкодов интро/аутро (`timeIntro`, `timeOutro`, `timeIntroEnd`, `timeOutroEnd`) — уже заложена возможность кнопки "пропустить заставку".
- `Users` — пользователи.
- `WatchHistories` — история просмотров (заготовка под "продолжить просмотр" и под рекомендательную систему).
- `Subscriptions`, `Groups`, `GroupUsers` — модель подписок и семейного доступа уже спроектирована на уровне схемы (`countMembers`, `validityTime`, `isOwner`), но **не реализована в API** — нет ни одного эндпоинта, который бы с ними работал.
- `Feedback` — оценки и отзывы (`Valuation` 1–10, текст).
- `RefreshJwtTokens` — refresh-токены.
- Расставлены индексы на внешние ключи (`idx_filmgenres_filmid` и аналогичные) — хороший знак, что про производительность думали с самого начала, а не постфактум.
- `shelves`, `user_recomendations`, `user_events`, `user_factors`, `movie_factors` — таблицы под рекомендательную систему (Фаза 1) уже накатаны миграциями `0002`/`0003`. Это только схема: SQL-правила, воркер и эндпоинты (`/api/home`, `/api/events`) по ним пока не написаны, но фундамент готов и на нём уже реально пишутся embedding-вектора при создании фильма.

**Важное наблюдение:** миграции переведены на `golang-migrate` (было — список `CREATE TABLE IF NOT EXISTS`, исполняемый при старте). Теперь есть версионирование, откаты (`.down.sql` на каждую миграцию) и история изменений схемы. Это закрывает первый пункт Фазы 0 (раздел 6.1).

### 3.3 Frontend — что реализовано

```
front-end/src/
├── api/                    — слой запросов к backend
├── components/
│   ├── adminPanel/          — fileDropZone, memberPicker, tagMultiSelect — переиспользуемые контролы формы добавления фильма
│   ├── banner/              — баннер на главной
│   ├── film_card/           — карточка фильма
│   ├── header/               — шапка: лого, навигация, поиск (визуально), кнопка профиля
│   ├── movie_library/        — библиотека фильмов, строки (movie_row) — как в Netflix/Кинопоиске
│   └── protectedRoutes/      — защищённые роуты
├── context/authContext/      — React Context для состояния авторизации
├── layouts/
│   ├── mainLayout.tsx
│   └── adminLayout.tsx        — отдельный layout для админ-раздела
├── pages/
│   ├── add/                   — страница добавления фильма (первая, более простая версия формы)
│   ├── admin/
│   │   ├── adminFilmPage.tsx   — полноценная форма создания фильма: жанры/страны/участники, таймкоды интро-аутро, загрузка медиа (~380 строк)
│   │   ├── catalogPage.tsx      — список фильмов в админке
│   │   ├── membersPage.tsx      — работа с участниками съёмок
│   │   └── referenceDataPage.tsx — управление справочниками (жанры/страны/роли)
│   ├── cinema/                — главная страница каталога
│   ├── login/
│   ├── player/                — ⚠️ ЗАГЛУШКА: `<div>Привет, player!</div>`, без реальной логики
│   └── register/
└── types/
```

**Реализовано:** регистрация, вход, защищённые роуты, отображение каталога фильмов рядами с баннером, полноценная форма добавления фильма с выбором жанров/стран/участников съёмок и таймкодами интро-аутро, отдельный раздел админки (`/admin`) со своим layout'ом и страницами каталога/участников/справочников.

**Не реализовано:** поиск (UI есть, бэкенда нет), сам плеер (полная заглушка — 2 строки), профиль пользователя, любая страница подписок/семьи, совместный просмотр, редактирование/удаление в списках админки (пока только просмотр и добавление), мобильная адаптация (требует отдельной проверки и доработки по всем компонентам).

### 3.4 Итоговая оценка прогресса

| Блок | Прогресс |
|---|---|
| Auth | ~80% (не хватает email-верификации и rate limiting) |
| Каталог фильмов (CRUD) | ~75% (не хватает поиска, редактирования/удаления, полноценной фильтрации) |
| Справочники (жанры/страны/роли/участники) | ~60% (CRUD на создание и поиск есть, редактирования/удаления нет) |
| Видеоплеер | ~5% (только заглушка) |
| Рекомендательная система | ~15% (схема БД накатана, embedding-вектор пишется при добавлении фильма; SQL-правила, воркер, `/api/home` — не начаты) |
| Подписки / семья | ~15% (есть схема БД, нет логики) |
| Совместный просмотр | 0% |
| Поиск | 0% |
| Email-верификация | 0% |
| Админ-панель | ~40% (отдельный layout, формы фильма/справочников/участников; редактирование, аналитика и управление подписками — впереди) |
| Инфраструктура (миграции, graceful shutdown) | Фаза 0 частично закрыта: миграции ✅, graceful shutdown ✅; health-check, slog, тесты, CI — впереди |
| CI/CD, тесты, Swagger | 0% |
| Адаптивная вёрстка | не проверено / частично |

---

## 4. Архитектура системы

### 4.1 Общая схема компонентов

```
                         ┌──────────────────┐
                         │     Браузер       │
                         │  (React + Vite)   │
                         └─────────┬─────────┘
                                   │ HTTPS / WSS
                                   ▼
                    ┌──────────────────────────────┐
                    │         Go Backend             │
                    │   (net/http, слоистая          │
                    │   архитектура handler→service   │
                    │   →repository)                  │
                    └───────┬───────────┬────────────┘
                            │           │
              ┌─────────────┘           └─────────────┐
              ▼                                        ▼
   ┌────────────────────┐                   ┌────────────────────┐
   │     PostgreSQL       │                   │        Redis         │
   │  + pgvector extension │                   │  (кеш рекомендаций,   │
   │  (фильмы, юзеры,       │                   │   rate limiting,      │
   │   рекомендации,        │                   │   WS-комнаты в        │
   │   embeddings, SGD-      │                   │   многоинстансном     │
   │   векторы)              │                   │   режиме — опционально)│
   └────────────────────┘                   └────────────────────┘
              ▲
              │
   ┌──────────┴───────────┐        ┌─────────────────────┐
   │   Offline-воркер       │        │     Gemini API        │
   │  (тикер 6ч, SGD,        │◄──────►│  (генерация embeddings)│
   │   пересчёт рекомендаций) │        └─────────────────────┘
   └──────────────────────┘

   ┌──────────────────────┐        ┌─────────────────────┐
   │   ffmpeg-воркер         │        │     Resend API         │
   │  (конвертация видео      │        │  (email-верификация)   │
   │   в HLS + AES-128         │        └─────────────────────┘
   │   шифрование сегментов)   │
   └──────────────────────┘
```

### 4.2 Слоистая архитектура backend

Текущий паттерн `handler → service → repository` сохраняется и масштабируется на все новые фичи:

- **handler** — только парсинг HTTP-запроса, вызов сервиса, формирование ответа. Никакой бизнес-логики.
- **service** — вся бизнес-логика, валидация, оркестрация нескольких repository-вызовов в рамках одной операции.
- **repository** — только SQL/Redis/внешние API-вызовы, без бизнес-логики.

Это разделение — то, что делает проект тестируемым: каждый `service` тестируется через мок-репозитории (интерфейсы), без поднятия реальной БД в unit-тестах.

### 4.3 Принцип эволюции схемы

Любая новая фича добавляется по шаблону:
1. Миграция через `golang-migrate` (новый пронумерованный файл).
2. Модели в `models/`.
3. Методы в `repository/` за интерфейсом.
4. Бизнес-логика в `service/`.
5. Хендлер + регистрация роута.
6. Swagger-аннотации над хендлером.
7. Тесты (unit на service, integration на handler).

---

## 5. Схема базы данных

### 5.1 Существующие таблицы (уже в продакшене кода)

```sql
Films(id, title, isSerial, description, trailerId)
Trailers(id, path)
FilmCards(id, filmId, path, is_horizontal)
Logos(id, path)
FilmLogos(id, logoId, filmId)
Countries(id, name)
FilmCountries(id, filmId, countryId)
Genres(id, name)
FilmGenres(id, filmId, genreId)
FilmingMembers(id, name)
Roles(id, name)
FilmFilmingMembers(id, filmId, memberId, roleId)
Materials(id, path, durationSeconds)
Seasons(id, filmId, cardId, numberSeason)
Releases(id, filmId, seasonId, materialId, number_seria, name, dateCreate,
         timeIntro, timeOutro, timeIntroEnd, timeOutroEnd)
Users(id, login, name, password, mail, phoneNumber, createdAt)
WatchHistories(id, userId, filmId, timeWatch, dateWatch)
Subscriptions(id, title, countMembers, validityTime)
Groups(id, subId, dateEnd)
GroupUsers(id, groupId, userId, isOwner)
Feedback(id, Valuation, text, userId, releaseId)
RefreshJwtTokens(jti, userId, deviceId, revoked, expired_time)
```

### 5.2 Новые таблицы — Рекомендательная система

> ✅ Таблицы ниже уже накатаны миграциями `0002_recSystem` / `0003_recSystem` и присутствуют в БД — это уже не план, а факт. Отличие от изначального проекта: `embedding` живёт не в отдельной таблице `movie_embeddings`, а прямо в `Films.embedding vector(3072)`; `user_recomendations.user_id` допускает `NULL` для глобальных (не персональных) рекомендаций.

```sql
shelves(id, type)
user_recomendations(id, user_id NULL, shelf_id, movie_id, source_entity_id, source_entity_type, score, updated_at)
user_events(id, user_id, event_type, entity_id, entity_type, count, last_occurred_at)
user_factors(id, user_id, factors FLOAT[], user_bias, updated_at)
movie_factors(id, movie_id, factors FLOAT[], movie_bias, updated_at)
-- Films.embedding VECTOR(3072) — вместо отдельной таблицы movie_embeddings
```
Подробное описание полей, индексов и алгоритмов работы — см. раздел 7.

### 5.3 Новые таблицы — Поиск

```sql
-- никаких новых таблиц не требуется, добавляется только индекс
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_films_title_trgm ON Films USING GIN (title gin_trgm_ops);
```

### 5.4 Новые таблицы — Видео / HLS / Субтитры

```sql
video_renditions(
    id          SERIAL PRIMARY KEY,
    materialId  INT REFERENCES Materials(id) ON DELETE CASCADE,
    quality     TEXT NOT NULL,        -- '360p','480p','720p','1080p'
    playlistPath TEXT NOT NULL,       -- путь к .m3u8 этого качества
    bandwidth   INT NOT NULL,         -- для master playlist
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW()
);

hls_encryption_keys(
    id          SERIAL PRIMARY KEY,
    materialId  INT REFERENCES Materials(id) ON DELETE CASCADE UNIQUE,
    keyBase64   TEXT NOT NULL,        -- AES-128 ключ (хранить шифрованным через KMS/секрет в .env на старте)
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW()
);

subtitle_tracks(
    id          SERIAL PRIMARY KEY,
    materialId  INT REFERENCES Materials(id) ON DELETE CASCADE,
    language    TEXT NOT NULL,        -- 'ru','en','ja' (ISO 639-1)
    label       TEXT NOT NULL,        -- 'Русский', 'English'
    path        TEXT NOT NULL,        -- .vtt файл
    isDefault   BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(materialId, language)
);
```

### 5.5 Новые таблицы — Email-верификация

```sql
email_verifications(
    id          SERIAL PRIMARY KEY,
    userId      INT REFERENCES Users(id) ON DELETE CASCADE,
    token       UUID NOT NULL DEFAULT gen_random_uuid(),
    expiresAt   TIMESTAMP NOT NULL,
    usedAt      TIMESTAMP,
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);

-- В Users добавляется поле:
ALTER TABLE Users ADD COLUMN isEmailVerified BOOLEAN NOT NULL DEFAULT FALSE;
```

### 5.6 Новые таблицы — Семья и промокоды

```sql
-- Group уже есть. Добавляем промокод приглашения:
ALTER TABLE Groups ADD COLUMN inviteCode TEXT UNIQUE;
-- генерируется при создании группы, короткий человекочитаемый код, напр. 'VDX-7K2QH'

family_invites(
    id          SERIAL PRIMARY KEY,
    groupId     INT REFERENCES Groups(id) ON DELETE CASCADE,
    invitedById INT REFERENCES Users(id),
    code        TEXT NOT NULL UNIQUE,   -- разовый код приглашения конкретного человека
    usedByUserId INT REFERENCES Users(id),
    expiresAt   TIMESTAMP NOT NULL,
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5.7 Новые таблицы — Совместный просмотр

```sql
watch_rooms(
    id          SERIAL PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,     -- короткий код комнаты для приглашения
    ownerId     INT REFERENCES Users(id),
    filmId      INT REFERENCES Films(id),
    releaseId   INT REFERENCES Releases(id),
    createdAt   TIMESTAMP NOT NULL DEFAULT NOW(),
    closedAt    TIMESTAMP
);

watch_room_members(
    id          SERIAL PRIMARY KEY,
    roomId      INT REFERENCES watch_rooms(id) ON DELETE CASCADE,
    userId      INT REFERENCES Users(id),
    joinedAt    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(roomId, userId)
);
```

---

## 6. Фаза 0 — Фундамент

**Цель:** подготовить инфраструктуру проекта так, чтобы каждая следующая фича добавлялась безопасно и тестируемо, без необходимости что-либо переделывать в фундаменте позже.

### 6.1 Версионируемые миграции

Перейти с встроенных `CREATE TABLE IF NOT EXISTS` на `golang-migrate`.

- Установка: `go get -tags 'postgres' github.com/golang-migrate/migrate/v4`.
- Структура: `migrations/000001_init_schema.up.sql` / `.down.sql`, далее по одному файлу на каждую новую фичу (`000002_add_recsys_tables.up.sql` и т.д.).
- Каждая `up`-миграция обязана иметь рабочую `down`-миграцию — это проверяется в CI (накатить → откатить → накатить снова).
- В `main.go` миграции запускаются программно через `migrate.New(...)` при старте, либо отдельной командой `make migrate-up` перед запуском в проде.

### 6.2 Graceful shutdown

```go
ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
defer stop()

srv := &http.Server{Addr: ":8080", Handler: router}
go func() {
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatal(err)
    }
}()

<-ctx.Done()
shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
srv.Shutdown(shutdownCtx)
db.DB.Close()
```

### 6.3 Health-check

`GET /healthz` — проверяет соединение с БД (`DB.Ping`), возвращает `200 OK` / `503 Service Unavailable`. Используется Docker healthcheck-ом и (в будущем) балансировщиком.

### 6.4 Структурированное логирование

Замена `log.Println`/`log.Fatal` на `slog` (стандартная библиотека с Go 1.21+):
```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
logger.Info("server started", "port", 8080)
logger.Error("db connection failed", "error", err)
```
JSON-формат логов — стандарт для последующего сбора в любую систему логирования (даже если сейчас читаешь их просто в консоли докера).

### 6.5 Тестовая инфраструктура

- `testify` для assertions и моков.
- Интерфейсы для всех repository (`type FilmRepository interface {...}`), чтобы service-слой тестировался с моками без БД.
- `testcontainers-go` — для integration-тестов поднимается реальный Postgres в Docker на время теста, прогоняются миграции, тестируется реальный SQL.
- Цель покрытия на старте — не 100%, а покрытие critical path: auth, films CRUD, к каждой новой фиче — тесты добавляются сразу, а не откладываются.

### 6.6 CI (GitHub Actions)

`.github/workflows/ci.yml`:
```yaml
name: CI
on: [pull_request, push]
jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.22' }
      - run: go vet ./...
      - run: go test ./... -race -cover
      - run: go build ./...
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: front-end
      - run: npm run lint
        working-directory: front-end
      - run: npm run build
        working-directory: front-end
```
Деплой (`cd.yml`) добавляется позже, в Фазе 8, когда определишься с хостингом.

### 6.7 Чек-лист Фазы 0
- [x] `golang-migrate` подключён, все текущие таблицы перенесены в первую миграцию
- [x] Graceful shutdown реализован
- [ ] `/healthz` работает
- [ ] Логирование переведено на `slog`
- [ ] Интерфейсы repository выделены
- [ ] Первые unit-тесты на `service/auth.go` и `service/films.go`
- [ ] CI workflow зелёный на каждый PR

---

## 7. Фаза 1 — Рекомендательная система

> Полная архитектура была спроектирована заранее (см. исходный документ `voidex_recsys_architecture.docx`) и переносится сюда целиком как часть единой документации проекта.

### 7.1 Общая концепция

Система состоит из трёх независимых слоёв, результаты которых объединяются в финальные "полки" на главной странице:

1. **SQL-правила** (простейший слой) — работает с первого дня, без накопления данных: популярное, новинки, топ по рейтингу.
2. **Content-based через pgvector** (средний) — векторное представление фильмов от Gemini, поиск похожих по смыслу описания/жанрам/актёрам. Полки "Похожее на X".
3. **Collaborative filtering через SGD** (сложный) — матричная факторизация поведения пользователей, начинает работать точно после 20+ действий юзера. Полка "Вам может понравиться".

### 7.2 Режимы вычислений

- **Offline** — раз в 6 часов, тикер в `main.go`, полный пересчёт для всех пользователей, результат в `user_recommendations`.
- **Nearline** — по событию пользователя (горутина `RecalculateForUser`), пересчёт только для одного юзера, занимает секунды.
- **Online** — момент запроса `/api/home`: чтение готовых данных из Redis (или PostgreSQL при промахе кеша), без каких-либо вычислений на лету.

### 7.3 Сбор сигналов и confidence

| Событие | Confidence |
|---|---|
| watch 90–100% | 0.9 |
| watch 70–90% | 0.7 |
| watch 50–70% | 0.5 |
| watch 30–50% | 0.3 |
| watch 10–30% | 0.15 |
| watch 0–10% | 0.05 |
| like | 1.0 |
| click | 0.05 |
| trailer_watch | 0.03 |
| search_click | 0.04 |
| onboarding_genre | 0.4 |

Итоговый confidence пары юзер-фильм считается суммированием взвешенных сигналов за последние 60 дней с логарифмическим сглаживанием, нормализацией в 0..1 и временным decay (старые события весят меньше — реализация temporal dynamics по Koren 2009).

### 7.4 SQL-правила

- **Популярное** — Maximal Volume Algorithm: топ-100 популярных за 30 дней → группировка по жанрам → 1-2 лучших на жанр → итоговые 20 максимально разнообразны.
- **Новинки** — топ-20 по дате релиза, уже просмотренные исключаются.
- **Топ по рейтингу** — средняя оценка из `Feedback`, фильмы с менее чем 10 оценками исключаются.
- **Баннер** — 5 фильмов, комбинированный score `0.6×rating + 0.4×recency`.

### 7.5 Онбординг нового пользователя

Экран выбора 3-5 жанров после регистрации → запись в `user_events` как `onboarding_genre` → горутина `RecalculateForUser` → персональные полки готовы до первого захода на главную.

Переход cold start → опытный пользователь:
- 0 событий — глобальные полки;
- 1-5 — подмешивается content-based;
- 5-20 — персонализированные SQL-правила по жанрам;
- 20+ — полный гибридный режим с collaborative filtering.

### 7.6 Content-based через pgvector + Gemini

> ✅ **Первая часть уже реализована.** При добавлении фильма (`service/add.go → AddProject`) формируется строка `"Название: ...; Описание: ...; Страны: ...; Жанры: ...; Участники: <имя>: <роль>, ..."`, отправляется в Gemini (`gemini-embedding-001`), получаем вектор из **3072** чисел (не 768, как планировалось изначально) и сохраняем прямо в колонке `Films.embedding vector(3072)` (миграция `0002_recSystem`) — без отдельной таблицы `movie_embeddings`.
>
> Ещё не сделано: поиск похожих фильмов по вектору, диверсификация выдачи, ivfflat-индекс, эндпоинт, который бы это отдавал.

- Поиск похожих: `ORDER BY embedding <=> $1 LIMIT 30`, затем диверсификация в Go до топ-10 разных по жанрам.
- Индекс: `CREATE INDEX ON Films USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`

### 7.7 Collaborative filtering — SGD

Матричная факторизация: `prediction(u,i) = global_bias + user_bias[u] + movie_bias[i] + dot(user_factors[u], movie_factors[i])`.

Шаг SGD на пару (u, i):
```
pred = global_bias + user_bias[u] + movie_bias[i] + dot(user_vec, movie_vec)
err  = confidence(u,i) - pred
user_vec    += lr * (err * movie_vec - lambda * user_vec)
movie_vec   += lr * (err * user_vec  - lambda * movie_vec)
user_bias[u]  += lr * (err - lambda * user_bias[u])
movie_bias[i] += lr * (err - lambda * movie_bias[i])
```
`lr = 0.01`, `lambda = 0.01`, 10–20 эпох, факторы по 50 чисел, инициализация случайными числами 0.01–0.1.

**Fold-in для нового юзера** — векторы фильмов фиксированы, для нового юзера делается 5–10 быстрых шагов SGD только по его вектору (миллисекунды вместо минут полного пересчёта).

### 7.8 Redis-кеш и `/api/home`

- Ключ `home:{userID}`, TTL 6 часов, синхронизирован с offline-циклом.
- При nearline-пересчёте — `DEL home:{userID}`, следующий запрос пересоберёт кеш из свежих данных.
- Порядок полок: "Продолжить просмотр" → content-based → collaborative → персональные жанровые → популярное → новинки → топ по рейтингу.

### 7.9 Структура воркера

```
workers/recommendation_worker.go  — RecalculateAll, RecalculateForUser, calculateSQLRules,
                                     calculateContentBased, calculateCollaborative, foldIn
workers/sgd.go                    — runSGD, calculateConfidence, dotProduct, initFactors
workers/diversity.go              — applyMaximalVolume, diversify
```

### 7.10 Порядок реализации (детально)

1. ✅ Таблицы (`shelves`, `user_recomendations`, `user_events`, `user_factors`, `movie_factors`; вместо отдельной `movie_embeddings` — колонка `embedding` прямо в `Films`) — миграции `0002`/`0003`.
2. ⏳ Подключение Redis, базовые операции.
3. ⏳ `calculateSQLRules` + запись в `user_recommendations`.
4. ⏳ `GET /api/home` (чтение из Redis/PostgreSQL).
5. ⏳ `POST /api/events`, `PATCH /api/films/{id}/watch` — сбор сигналов.
6. ⏳ Онбординг — `POST /api/users/onboarding`.
7. ✅ pgvector + Gemini API при добавлении фильма — реализовано раньше остальных шагов, см. 3.1 и 7.6.
8. ⏳ `calculateContentBased`.
9. ⏳ `runSGD`.
10. ⏳ `calculateCollaborative`.
11. ⏳ `foldIn`.
12. ⏳ Запуск воркера в `main.go` (тикер 6ч + nearline-горутины).

Фактический порядок разработки пошёл не строго по плану — сначала закрыт шаг 1 (схема) и шаг 7 (embedding при создании фильма), потому что это было логично сделать сразу вместе с CRUD фильмов. Остальные шаги (SQL-правила, Redis, `/api/home`, SGD) пока не начаты.

### 7.11 Обучающий трек (для самостоятельного освоения перед реализацией)

Перед написанием боевого кода — три практических упражнения:
1. Получение embeddings через Gemini API и ручной расчёт cosine similarity на 3-4 предложениях.
2. Локальный Postgres + pgvector: вставка embeddings через Go, поиск ближайших соседей, сверка с ручным расчётом.
3. Реализация SGD с нуля на игрушечной матрице 5×5 без библиотек — наглядное понимание механики градиентного спуска перед переносом на реальные 50-мерные векторы.

---

## 8. Фаза 2 — Поиск через триграммы

### 8.1 Зачем триграммы, а не `LIKE`

`LIKE '%запрос%'` не использует индексы эффективно и не прощает опечаток. Триграммный индекс (`pg_trgm`) раскладывает строки на последовательности из 3 символов и индексирует их через GIN, что даёт быстрый нечёткий поиск, устойчивый к опечаткам и частичным совпадениям.

### 8.2 Реализация

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_films_title_trgm ON Films USING GIN (title gin_trgm_ops);
```

```sql
SELECT id, title, similarity(title, $1) AS score
FROM Films
WHERE title % $1          -- оператор схожести pg_trgm
ORDER BY score DESC
LIMIT 20;
```

### 8.3 Эндпоинт

`GET /api/films/search?q=атака+титанов&limit=20` → `service.SearchFilms` → `repository.SearchFilmsTrigram`.

### 8.4 Расширение на фронте

Дебаунс инпута в `searchBar.tsx` (300-400мс), отображение выпадающего списка с превью карточек по мере ввода.

### 8.5 Тесты

Integration-тест: засеять 5-10 фильмов с разными названиями (включая опечатки в запросе типа "атака титанф") и проверить, что нужный фильм находится в топ-3 результатов.

---

## 9. Фаза 3 — Видеоплеер, HLS и защита контента

### 9.1 Этап 1 — Базовый плеер (без HLS)

Замена заглушки на нормальный `<video>`-плеер:
- кастомные контролы (play/pause, прогресс-бар с превью при наведении, громкость, fullscreen, скорость воспроизведения);
- сохранение прогресса — каждые 30 секунд `PATCH /api/films/{id}/watch` с `watched_seconds`, запись в `WatchHistories`;
- "продолжить с N секунд" при повторном открытии;
- кнопка "Пропустить заставку" по полям `timeIntro`/`timeOutro` из `Releases` (уже есть в схеме).

### 9.2 Этап 2 — Конвертация в HLS

Зачем: прямая раздача целого `.mp4`-файла не даёт адаптивного битрейта (юзер с плохим интернетом будет получать буферизацию вместо понижения качества) и плохо защищена от скачивания одним кликом.

Пайплайн при загрузке материала:
```
исходный файл → ffmpeg → набор сегментов (.ts, по 6-10 сек) на каждое качество
                        → .m3u8 плейлист на каждое качество
                        → master.m3u8, объединяющий все качества
```

Пример команды ffmpeg для одного качества (повторяется для 360p/480p/720p/1080p):
```bash
ffmpeg -i input.mp4 \
  -vf scale=-2:720 -c:v h264 -b:v 2800k \
  -c:a aac -b:a 128k \
  -hls_time 6 -hls_playlist_type vod \
  -hls_segment_filename "720p_%03d.ts" \
  720p.m3u8
```
Это либо отдельный Go-воркер, вызывающий `ffmpeg` через `os/exec` асинхронно после загрузки материала (со статусом `processing` → `ready` в БД), либо отдельный микросервис — на старте достаточно горутины с очередью на одну загрузку.

Результаты пишутся в таблицу `video_renditions` (раздел 5.4).

### 9.3 Этап 3 — Защита контента (signed URLs + AES-128)

**Важная честная оговорка:** это не полноценный DRM (Widevine/FairPlay/PlayReady) — тот требует партнёрской интеграции с Google/Apple и в одиночку как pet-проект практически нереализуем. Описанный ниже подход — реалистичный и технически содержательный уровень защиты, который реально показать на собеседовании и реально объяснить от и до, в отличие от "подключил чужой SDK".

**AES-128 шифрование HLS-сегментов:**
```bash
ffmpeg -i input.mp4 ... \
  -hls_key_info_file key_info.txt \
  -hls_segment_filename "720p_%03d.ts" \
  720p.m3u8
```
`key_info.txt` указывает на URI ключа и сам файл ключа. Сегменты на диске хранятся уже зашифрованными AES-128. Ключ генерируется на воркере и сохраняется в `hls_encryption_keys`.

**Выдача ключа только авторизованным:**
- Эндпоинт `GET /api/films/{id}/key` отдаёт сырой бинарный ключ только если у запроса валидный JWT и (в будущем) активная подписка/доступ к этому фильму.
- В `.m3u8` плейлисте URI ключа указывает не на статический файл, а на этот защищённый эндпоинт.

**Signed URLs на сегменты и плейлисты:**
- Вместо прямой раздачи `/uploads/hls/...` — эндпоинт `GET /api/stream/{token}/{segment}`, где `token` — подписанный HMAC-токен с `materialId`, `userId`, `exp` (TTL 5-10 минут).
- При запросе `/api/films/{id}/playlist` сервер генерирует master playlist с подписанными ссылками на сегменты, действительными ограниченное время — это затрудняет шаринг прямой ссылки на видео.

**Что это даёт на практике:** прямое скачивание `.mp4` одним правым кликом невозможно (плеер работает с зашифрованными сегментами и временными ссылками), что для портфолио и для реальной демонстрации уровня — достаточно серьёзно, и при этом полностью объяснимо в коде, без чёрных ящиков сторонних DRM-провайдеров.

### 9.4 Фронтенд — hls.js

```ts
import Hls from 'hls.js';

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(masterPlaylistUrl);
  hls.attachMedia(videoElement);
} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
  videoElement.src = masterPlaylistUrl; // нативная поддержка в Safari
}
```
Переключение качества — либо автоматическое (адаптивный битрейт через `hls.js`), либо ручной селектор качества в UI поверх `hls.levels`.

### 9.5 Чек-лист Фазы 3
- [ ] Базовый плеер с контролами и сохранением прогресса
- [ ] ffmpeg-пайплайн конвертации в HLS (минимум 2 качества для старта: 480p, 720p)
- [ ] AES-128 шифрование сегментов
- [ ] Эндпоинт выдачи ключа с проверкой авторизации
- [ ] Signed URLs с TTL на сегменты/плейлисты
- [ ] Интеграция hls.js на фронте
- [ ] Кнопка "Пропустить заставку"

---

## 10. Фаза 3.5 — Субтитры

### 10.1 Формат и хранение

Формат `.vtt` (WebVTT) — нативно поддерживается HTML5 `<track>` и hls.js. Файлы привязываются к `Materials` через таблицу `subtitle_tracks` (раздел 5.4), с языком (`ISO 639-1`) и флагом `isDefault`.

### 10.2 Загрузка

Расширение существующего `POST /api/films/upload` (или отдельный эндпоинт `POST /api/films/{id}/subtitles`) — приём `.vtt`/`.srt` (конвертация `.srt → .vtt` через `ffmpeg` при необходимости), сохранение пути в `subtitle_tracks`.

### 10.3 Фронтенд

```tsx
<video>
  <track kind="subtitles" src={track.path} srcLang={track.language} label={track.label} default={track.isDefault} />
</video>
```
Селектор языка субтитров в UI плеера, переключение через `textTracks` API.

---

## 11. Фаза 4 — Подписки и семейный доступ

### 11.1 Активация подписки

`POST /api/subscriptions/{id}/activate` — создаёт запись в `Groups` (`subId`, `dateEnd = NOW() + validityTime дней`) и добавляет текущего юзера в `GroupUsers` с `isOwner = true`. Оплата на старте — замокана (отдельный сервис `payment.MockCharge`, возвращающий "успех"), с возможностью позже подключить реальный провайдер (ЮKassa/Stripe) без изменения остальной логики — платёжный шаг изолирован за интерфейсом.

### 11.2 Генерация промокода группы

При создании `Groups` генерируется `inviteCode` — короткий человекочитаемый код (`VDX-XXXXX`, base32 без неоднозначных символов типа 0/O, 1/I).

### 11.3 Вступление в группу по промокоду

`POST /api/groups/join` с телом `{ "code": "VDX-7K2QH" }`:
- найти группу по `inviteCode`,
- проверить, что `dateEnd` ещё не истёк,
- проверить текущее количество участников против `countMembers` подписки,
- добавить в `GroupUsers`.

### 11.4 Приглашение конкретного человека ("из семьи")

Отдельный механизм точечного приглашения (раздел 5.6, `family_invites`): владелец группы генерирует одноразовый код с TTL, например, отправляет ссылку другу — `POST /api/groups/{id}/invite` → код → `POST /api/groups/invite/accept` с этим кодом, что отличается от общего `inviteCode` группы тем, что код одноразовый и привязан к конкретному приглашению, а не переиспользуется бесконечно.

### 11.5 Мидлварь проверки доступа

`SubscriptionMiddleware` — проверяет, состоит ли юзер в активной (по `dateEnd`) группе перед выдачей доступа к контенту, помеченному как премиум (если решишь разделять каталог на free/premium — опционально, можно и без paywall, чисто для демонстрации механики).

---

## 12. Фаза 5 — Email-верификация

### 12.1 Flow

1. При регистрации создаётся `email_verifications` с UUID-токеном и `expiresAt = NOW() + 24h`.
2. Письмо отправляется через Resend API со ссылкой `https://voidex.app/verify?token=...`.
3. `GET /api/auth/verify?token=...` — находит запись, проверяет `expiresAt` и `usedAt IS NULL`, ставит `Users.isEmailVerified = true`, `usedAt = NOW()`.
4. Повторная отправка — `POST /api/auth/resend-verification` (с rate limiting, чтобы не спамить).

### 12.2 Resend API в Go

```go
req, _ := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(body))
req.Header.Set("Authorization", "Bearer "+os.Getenv("RESEND_API_KEY"))
req.Header.Set("Content-Type", "application/json")
```
Тело запроса — JSON с `from`, `to`, `subject`, `html` (шаблон письма с кнопкой подтверждения).

### 12.3 Ограничение неподтверждённых аккаунтов

Опционально: до подтверждения почты — доступ к части функционала (например, оставлению отзывов или совместному просмотру) ограничен, чтобы мотивировать подтвердить адрес.

---

## 13. Фаза 6 — Совместный просмотр через WebSocket

### 13.1 Архитектура комнаты

```go
type Room struct {
    ID      string
    Clients map[*Client]bool
    Broadcast chan Event
    mu      sync.RWMutex
}

type Hub struct {
    Rooms map[string]*Room
    mu    sync.RWMutex
}
```
Каждый `Client` — отдельная горутина на чтение (`readPump`) и отдельная на запись (`writePump`), общение через буферизированные каналы — классический паттерн `gorilla/websocket`.

### 13.2 События

```go
type Event struct {
    Type    string  `json:"type"`    // "play","pause","seek","chat","user_joined","user_left"
    Payload any     `json:"payload"`
    UserID  int     `json:"user_id"`
    Time    float64 `json:"time,omitempty"` // для play/pause/seek — текущая позиция видео
}
```

### 13.3 Синхронизация воспроизведения

- При `play`/`pause`/`seek` от любого клиента — сервер транслирует событие всем остальным участникам комнаты, кроме отправителя.
- На фронте плеер слушает входящие события и применяет их программно (`videoRef.current.currentTime = payload.time`), с флагом `isRemoteUpdate`, чтобы не уйти в бесконечный цикл рассылки своих же действий.
- Простая защита от рассинхрона: периодический heartbeat с текущей позицией от "хозяина" комнаты (первый зашедший/владелец), остальные плавно подстраиваются, если расхождение больше 2-3 секунд.

### 13.4 Создание и вход в комнату

- `POST /api/rooms` — создаёт `watch_rooms` с уникальным `code`, привязывает к `filmId`/`releaseId`.
- `POST /api/rooms/join` с `{code}` — добавляет в `watch_room_members`.
- Вход через семейный промокод — если юзер состоит в той же `Groups`, что и владелец комнаты, вход без отдельного кода (упомянутая тобой идея "пригласить кого-то из семьи").
- WebSocket-соединение: `wss://.../ws/rooms/{roomId}?token=...` — токен передаётся как query-параметр (т.к. браузерный WebSocket API не поддерживает кастомные заголовки), валидируется при апгрейде соединения.

### 13.5 Чат (опционально, но дёшево добавить раз WS уже есть)

Тип события `chat` с текстом сообщения — рассылается всем в комнате, без сохранения в БД на первой итерации (эфемерный чат), либо с сохранением в простую таблицу `room_messages` при желании истории.

### 13.6 Тестирование WebSocket-логики

Юнит-тесты на `Hub`/`Room` — без реального сетевого соединения, тестируется напрямую логика broadcast и управления подключениями (мок `*Client` с каналом вместо реального conn). Отдельный integration-тест с реальным `httptest.Server` + `gorilla/websocket` клиентом для проверки полного цикла подключения.

---

## 14. Фаза 7 — Адаптивность и мобильная версия

### 14.1 Принцип

Адаптивная вёрстка добавляется не отдельным этапом постфактум, а требованием к каждому компоненту с самого начала — переделывать вёрстку под мобильные после факта значительно дороже, чем сразу проектировать mobile-first.

### 14.2 Конкретные точки внимания

- Сетка карточек фильмов (`movie_row`) — горизонтальный скролл со свайпом на мобильных вместо фиксированной сетки.
- Шапка (`header`) — сворачивание навигации в гамбургер-меню на узких экранах, поиск — отдельный полноэкранный режим на мобильных вместо инлайн-поля.
- Плеер — контролы с увеличенной зоной нажатия для тача, жесты (свайп для перемотки/громкости — опционально, как у YouTube/Netflix мобильных вебов).
- Админ-панель — допустимо оставить desktop-only (это инструмент для тебя самого, не для массового пользователя), но стоит явно об этом написать в README, чтобы не выглядело недоработкой.
- Брейкпоинты Tailwind: `sm:` (640px), `md:` (768px), `lg:` (1024px) — использовать последовательно по всем компонентам, не точечно.

### 14.3 Проверка

Реальное тестирование на нескольких физических ширинах (не только DevTools-эмуляция): iPhone SE (375px) как нижняя граница, iPad (768px) как промежуточная.

---

## 15. Фаза 8 — Финальная полировка

### 15.1 Админ-панель

Довести `pages/add` от черновой формы до полноценного раздела:
- список всех фильмов с возможностью редактирования/удаления (сейчас есть только добавление);
- управление жанрами/странами/актёрами (CRUD-формы для справочников);
- список пользователей с возможностью бана/изменения роли;
- базовая аналитика: количество пользователей, просмотров за период, самые популярные фильмы (можно переиспользовать SQL из рекомендательной системы);
- управление подписками (создание тарифов).

### 15.2 Swagger

`swaggo/swag` — аннотации добавляются по ходу разработки каждой новой фичи (не откладывать на самый конец):
```go
// GetFilms godoc
// @Summary      Получить список фильмов
// @Tags         films
// @Param        limit query int false "лимит"
// @Param        lastId query int false "id для пагинации"
// @Success      200 {array} models.Film
// @Router       /api/films [get]
```
Генерация: `swag init -g main.go`, раздача UI на `/swagger/index.html`.

### 15.3 Тесты — целевое покрытие

- Unit-тесты на весь `service`-слой (моки repository).
- Integration-тесты на критичные хендлеры через `testcontainers-go`: auth, films, search, recsys SQL-правила, WebSocket-комнаты.
- E2E (опционально, если останется время): Playwright на 2-3 ключевых сценария (регистрация → логин → просмотр фильма → отзыв).

### 15.4 README верхнего уровня (короткий, для GitHub)

Этот документ (50 страниц) — внутренняя инженерная документация. Дополнительно стоит сделать короткий `README.md` для самого репозитория (1-2 страницы): что за проект, скриншоты/GIF демо, стек, как запустить локально (`docker-compose up`), ссылка на эту подробную документацию. Именно короткий README читают в первую очередь на собеседовании.

### 15.5 Деплой

CD-пайплайн (GitHub Actions `cd.yml`) — сборка Docker-образов, пуш в registry, деплой на выбранный хостинг (VPS + `docker-compose`, либо Render/Railway/Fly.io для упрощения). Домен + HTTPS (Let's Encrypt через `certbot` или встроенный механизм хостинга).

---

## 16. Сводная таблица API-эндпоинтов

| Метод | Путь | Статус | Фаза |
|---|---|---|---|
| POST | `/api/auth/register` | ✅ реализовано | — |
| POST | `/api/auth/login` | ✅ реализовано | — |
| POST | `/api/auth/refresh` | ✅ реализовано | — |
| GET | `/api/auth/verify` | ⏳ | 5 |
| POST | `/api/auth/resend-verification` | ⏳ | 5 |
| GET | `/api/films` | ✅ реализовано | — |
| GET | `/api/films/{id}` | ✅ реализовано | — |
| POST | `/api/films` | ✅ реализовано | — |
| POST | `/api/films/upload` | ✅ реализовано | — |
| GET | `/api/films/genres` | ✅ реализовано | — |
| POST | `/api/films/genres` | ✅ реализовано | — |
| GET | `/api/films/countries` | ✅ реализовано | — |
| POST | `/api/films/countries` | ✅ реализовано | — |
| GET | `/api/films/roles` | ✅ реализовано | — |
| POST | `/api/films/roles` | ✅ реализовано | — |
| GET | `/api/films/filming-members/search` | ✅ реализовано | — |
| POST | `/api/films/filming-members` | ✅ реализовано | — |
| GET | `/api/films/search` | ⏳ | 2 |
| PATCH | `/api/films/{id}/watch` | ⏳ | 3 |
| GET | `/api/films/{id}/playlist` | ⏳ | 3 |
| GET | `/api/films/{id}/key` | ⏳ | 3 |
| GET | `/api/stream/{token}/{segment}` | ⏳ | 3 |
| POST | `/api/films/{id}/subtitles` | ⏳ | 3.5 |
| GET | `/api/home` | ⏳ | 1 |
| POST | `/api/events` | ⏳ | 1 |
| POST | `/api/users/onboarding` | ⏳ | 1 |
| POST | `/api/subscriptions/{id}/activate` | ⏳ | 4 |
| POST | `/api/groups/join` | ⏳ | 4 |
| POST | `/api/groups/{id}/invite` | ⏳ | 4 |
| POST | `/api/groups/invite/accept` | ⏳ | 4 |
| POST | `/api/rooms` | ⏳ | 6 |
| POST | `/api/rooms/join` | ⏳ | 6 |
| GET | `/ws/rooms/{roomId}` | ⏳ | 6 |
| GET | `/healthz` | ⏳ | 0 |
| GET | `/swagger/index.html` | ⏳ | 8 |

---

## 17. Оценка трудозатрат и сроков

Оценка дана из расчёта разработки впервые осваиваемых технологий (embeddings, pgvector, SGD, WebSocket, HLS-шифрование) — то есть с учётом времени на обучение, не только на написание кода.

| Фаза | Часы (с учётом обучения) |
|---|---|
| 0 — Фундамент | 15–20 |
| 1 — Рекомендательная система | 50–70 |
| 2 — Поиск через триграммы | 5–8 |
| 3 — Плеер + HLS + защита контента | 45–60 |
| 3.5 — Субтитры | 10–15 |
| 4 — Подписки и семья | 10–15 |
| 5 — Email-верификация | 6–8 |
| 6 — Совместный просмотр (WebSocket) | 20–28 |
| 7 — Адаптивность/мобильная версия | включено в каждую фронт-фичу (+15% к их времени) |
| 8 — Полировка (админка, swagger, тесты, деплой) | 20–25 |
| **Итого** | **~210–270 часов** |

**При занятости 3 часа в день:**
- 7 дней в неделю без пропусков: 70–90 дней (≈ 10–13 недель, 2.5–3 месяца).
- Реалистичнее, 5 дней в неделю с учётом форс-мажоров и застреваний на новых темах: **4–5 месяцев**.

Рекомендуется не фиксироваться на точной дате финиша, а раз в 2-3 недели сверяться с прогрессом по чек-листам фаз и при необходимости корректировать план — например, при нехватке времени в первую очередь сокращать Фазу 6 (совместный просмотр) или упрощать Фазу 3 (один уровень качества HLS вместо четырёх), а не делать всё на 70% готовности.

---

## 18. Риски и компромиссы

| Риск | Митигация |
|---|---|
| SGD/embeddings — совершенно новая область, велик шанс застрять | Обязательный обучающий трек перед реализацией (раздел 7.11), закладывать +30% буфер времени |
| Полный DRM нереализуем в одиночку | Сознательно заменён на честную и объяснимую защиту: AES-128 HLS + signed URLs (раздел 9.3) |
| WebSocket-синхронизация плеера подвержена рассинхрону при плохом соединении участников | Heartbeat-коррекция от хозяина комнаты, допустимый порог расхождения 2-3 сек |
| Миграции, написанные после того как в БД уже есть данные, рискуют сломать прод | Каждая `up`-миграция тестируется в CI вместе с `down` до мерджа |
| Объём задач может демотивировать при работе по 3ч/день в одиночку | План разбит на фазы с собственными чек-листами — каждая фаза самостоятельно демонстрируема и закрываема, не нужно ждать "всё или ничего" |
| Хранение видео на локальном диске не масштабируется | Сознательный компромисс для pet-проекта; зафиксировано как осознанное архитектурное решение, с описанием пути миграции на S3-совместимое хранилище при необходимости |

---

## 19. Чек-лист готовности к собеседованиям

К моменту завершения всех фаз проект должен закрывать следующие темы, которые можно явно проговорить на собеседовании:

- [ ] Проектирование реляционной схемы с нормализацией и явными many-to-many связями
- [ ] JWT-аутентификация с отзывом токенов и привязкой к устройству
- [ ] Версионируемые миграции и безопасные откаты схемы
- [ ] Слоистая архитектура (handler/service/repository) и её польза для тестируемости
- [ ] Работа с векторными embeddings и pgvector
- [ ] Реализация ML-алгоритма (SGD/матричная факторизация) с нуля, без готовых библиотек
- [ ] Кеширование с явной стратегией инвалидации (Redis, TTL, nearline-пересчёт)
- [ ] Конкурентное программирование на Go (горутины, каналы, WebSocket hub)
- [ ] Видео-стриминг: HLS, адаптивный битрейт, шифрование сегментов, signed URLs
- [ ] Полнотекстовый/нечёткий поиск через специализированные индексы PostgreSQL
- [ ] CI/CD пайплайн с автоматическим тестированием
- [ ] Документация API через Swagger
- [ ] Принятие и объяснение архитектурных компромиссов (например, почему не полный DRM, а AES-128 HLS)

---

*Документ является живым — обновляется по мере продвижения по фазам. Статусы (✅/⏳) в разделах 3 и 16 — источник правды о текущем прогрессе проекта. Последняя актуализация: закрыты п. 6.1 и 6.2 Фазы 0 (миграции через `golang-migrate`, graceful shutdown), частично реализован п. 7.6 Фазы 1 (Gemini-embeddings пишутся при создании фильма), добавлены CRUD-эндпоинты справочников и участников съёмок, админ-панель фронтенда выросла до отдельного раздела с несколькими страницами.*
