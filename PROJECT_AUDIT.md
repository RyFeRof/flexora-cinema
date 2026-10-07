# Аудит Voidex (read-only)

Срез кода на 2026-09-20. Ничего не менялось. Если вывод предположительный — так и помечено.

---

## 1. Карта проекта

Монорепозиторий: Go API + React SPA + Postgres. План в `README.md` шире, чем код.

| Путь | Роль |
|---|---|
| `back-end/main.go` | Точка входа: `.env`, БД, Gemini, кеш справочников, JWT, HTTP `:8080`, тикер чистки refresh, graceful shutdown |
| `back-end/route/router.go` | `http.ServeMux`, все `/api/*`, статика `/uploads/` |
| `back-end/handlers/` | HTTP: decode → service → encode |
| `back-end/service/` | Валидация, embedding-текст, auth, таймкоды |
| `back-end/repository/` | SQL и запись файлов на диск |
| `back-end/models/` | DTO/сущности, JWT-менеджер |
| `back-end/db/db.go` | `pgxpool` + `golang-migrate` из `file://migrations` |
| `back-end/migrations/` | `0001_init`, `0002_recSystem`, `0003_recSystem` (up/down) |
| `back-end/middleware/` | JWT access, CORS на `localhost:5173` |
| `back-end/jwtContext/` | Глобальный `JwtManager` |
| `back-end/gemini/` | Клиент embeddings |
| `back-end/cache/` | In-memory жанры/страны/роли |
| `front-end/src/main.tsx` | React root + `BrowserRouter` + `AuthProvider` |
| `front-end/src/App.tsx` | Роуты: login/register, `/`, `/watch`, `/admin/*` |
| `front-end/vite.config.ts` | Прокси `/api` и `/uploads` → `:8080` |
| `docker-compose.yml` | Postgres 16 (`5433`) + сборка backend |
| `Dockerfile` | Сборка Go из `back-end/` |
| `queries.txt` | Старые ручные INSERT, не часть приложения |

Конфиг: `godotenv.Load()` в `main.go:23`, строка БД только `DB_URL` (`db.go:22`). Секреты ожидаются из `.env` (в gitignore). В compose заданы `DB_HOST`/`DB_PASSWORD`, не `DB_URL`.

**API (роутер `router.go:13–28`):** register/login/refresh; GET/POST films; GET film by id; upload; CRUD-lite жанры/страны/роли; search/add filming-members. Нет `/healthz`, `/api/home`, logout, search films, watch progress.

Фронт: каталог на главной = баннер; админка (каталог/форма/участники/справочники); плеер-заглушка.

---

## 2. Архитектура и поток данных

Задумано: **handler → service → repository → pgxpool**. Реально так для auth, add film, search members, add справочников.

Частые отклонения:

- GET жанров/стран/ролей: handler → repository, без service (`genres_handler.go:12`, `countries_handler.go:12`, `roles_handler.go:12`).
- Upload: handler → repository, без service (`upload_handler.go:39`).
- Глобальные синглтоны: `db.DB`, `cache.RefCache`, `jwtcontext.JwtManager`, `gemini.client`. Интерфейсов репозиториев в коде нет (только план в README).

**Пример: создание фильма**

1. `POST /api/films` → `AuthMiddleware` → `handlers.AddProject` (`add_handler.go:10–24`).
2. `service.AddProject`: обязательные поля, дата, опционально `validateTimeline` (`timeline.go:68`), имена из кеша, участники из БД, сборка текста, `gemini.GetEmbedding` (`add.go:105–110`).
3. `repository.AddProject`: одна транзакция (`add.go:14–80`) — trailer, film+embedding, card, logo, M2M страны/жанры, batch участников, material, один Release (`number_seria=1`).

**Список фильмов:** `GetFilms` handler → service (лимит 1–100) → один JOIN (`films.go:10–21`). Жанры/страны/участники/дата не читаются.

**Auth:** bcrypt; access 15 мин + refresh 7 дней (`jwtAuth.go:63–67`); refresh в cookie HttpOnly (`login_handler.go:22–30`); jti в `RefreshJwtTokens`. Мидлварь проверяет Bearer и тип `access`, **claims в контекст не кладёт** (`auth.go:27–31`).

### pgvector

- Расширение и колонка: `0002_recSystem.up.sql:3–5` — `vector(3072)` на `Films`.
- Регистрация типов pgx: `db.go:29–30`.
- Запись: Gemini `gemini-embedding-001` (`client.go:26`) → `pgvector.NewVector` → INSERT (`repository/add.go:28–31`).
- Текст вектора: название, описание, страны, жанры, «имя: роль» (`service/add.go:15–29`).
- **Поиска нет:** ни `<=>`, ни ivfflat/hnsw в миграциях. Таблицы `user_recomendations` / `user_events` / `*_factors` / `shelves` нигде в Go не читаются.
- Заготовка полок закомментирована целиком: `handlers/admin_shelf.go`, `service/get_shelf.go` (вызовы `repository.Get*Shelf`, которых в репозитории нет). В роутер не подключено.

Итог: вектор пишется при создании фильма и дальше не используется. Индекса нет. Для `vector(3072)` стандартные ivfflat/hnsw в pgvector обычно ограничены ~2000 измерениями — индекс из README п.7.6, скорее всего, так не встанет (не проверял на живой БД).

---

## 3. Какие решения заложены и зачем

**Слои handler/service/repository.** Отделить HTTP от SQL, чтобы тестировать бизнес-логику. Интерфейсов и тестов пока нет — слой есть, тестируемость не закрыта.

**Версионируемые миграции + down.** Откат схемы и история; `db.Init` накатывает при старте (`db.go:39–61`).

**Транзакция на add film.** Чтобы полусозданный фильм не остался без карточки/релиза (`repository/add.go:14–80`). Embedding **до** tx: при падении SQL уже оплачен вызов Gemini.

**Кеш справочников + `Regenerate`.** Не ходить в БД за именами при каждом embedding; после POST жанра/страны/роли кеш пересобирается (`add_genre.go:20`). Не консистентен между инстансами (in-memory).

**JWT access/refresh + jti + deviceId + revoke.** Отзыв сессии устройства и «все сессии» при подозрительном refresh (`auth.go:89–92`). Logout в service есть (`auth.go:100–106`), хендлера нет.

**Cookie refresh + memory access на фронте.** Украсть refresh сложнее, чем из localStorage; access живёт в модуле `api/index.ts:10–14`. Очередь ретраев при параллельных 401 (`api/index.ts:29–54`).

**Схема «фильм → сезон → релиз + materials», таймкоды.** Сериалы и «пропустить заставку» без отдельной таблицы эпизодов. Сейчас add всегда пишет один релиз без сезона (`repository/add.go:76`).

**M2M жанры/страны/участники+роли.** Нормализация справочников, одна роль на связь, поиск участников отдельно. Индекса на `FilmingMembers.name` нет.

**Таблицы recsys заранее (`0002`/`0003`).** Полки, события, факторы SGD, глобальные рекомендации (`user_id` nullable + partial unique, `0003:5–9`). Код полок не дописан.

**Таблицы подписок/групп/feedback/watch history в `0001`.** Paywall, семья, оценки, прогресс — в API не используются.

**Публичные пути файлов + uuid-имя.** Не светить оригинал имени (`upload.go:16–28`). Раздача без auth.

**net/http ServeMux 1.22.** Без стороннего роутера.

**Gemini 3072 в колонке Films, не отдельная таблица.** Проще JOIN; цена — размер строки и лимиты индексов pgvector.

**Graceful shutdown + hourly token cleanup.** Не резать запросы и не копить протухшие jti (`main.go:42–69`). Тикер при shutdown не останавливается явно (процесс всё равно выходит).

---

## 4. Косяки (по серьёзности)

### Критично

1. **Секреты в репозитории.** Пароль Postgres `135720hk` в `docker-compose.yml:7,26`. В `front-end/src/pages/add/add.tsx:122` закомментирован JWT. Убрать из git, считать скомпрометированным, ротировать.

2. **Нет ролей / любой залогиненный — админ.** `AuthMiddleware` только проверяет access (`auth.go:10–33`). POST `/api/films`, upload, справочники доступны любому JWT. Заложить роль в Users + отдельный middleware.

3. **Статика `/uploads/` без авторизации** (`router.go:10–12`). Знающий URL скачает материал. Закрывать выдачу или signed URL (как в плане HLS).

4. **`JWT_SECRET` может быть пустым.** `InitAuth(os.Getenv("JWT_SECRET"))` без проверки (`main.go:33`, `jwtAuth.go:38–39`). Пустой HMAC = подделать токен. Падать при старте, если секрет короткий/пустой.

5. **Docker не совпадает с кодом.** Compose: `postgres:16` без pgvector — `CREATE EXTENSION vector` в `0002` упадёт. Env `DB_HOST`… vs код `DB_URL`. Volume `./uploads:./uploads` (`docker-compose.yml:33`) — невалидный target. Нет `JWT_SECRET`/`GEMINI_API_KEY`. Сверить compose с реальным локальным запуском.

6. **Gemini обязателен для добавления фильма.** Нет ключа — panic на старте (`main.go:25–27`); ошибка API — фильм не создаётся (`add.go:106–108`). Имеет смысл отделять «контент записан» от «вектор посчитан».

### Важно

7. **Claims не в контексте.** Нельзя понять userId в хендлере. Для событий/полок/админки это блокер. После Parse класть claims в `context`.

8. **Refresh: гонка и «вышибание всех сессий».** Два параллельных refresh: revoke device → второй видит revoked → `RevokeTokenAll` (`auth.go:89–92`). Плюс истёкший/удаленный jti при ещё валидной подписи. Продумать атомарную ротацию (одна tx, reuse-окно).

9. **Cookie: `Secure: false`, `SameSite: Lax`** (`login_handler.go:26–27`). На HTTPS/кросс-домене сломается или утечёт. Для прода — Secure + продуманный SameSite; CSRF на refresh.

10. **Регистрация: слабая валидация.** Только non-empty (`auth.go:40–54`). Нет уникальности `mail` (в схеме unique только login/phone, `0001:101–108`). Нет мин. длины пароля, формата email. Дубли почты возможны.

11. **Ошибки БД как 400 + текст наружу.** `AddProject` все err → 400 (`add_handler.go:18–20`); login/register отдают `err.Error()`. Утечка деталей и неверные статусы (unique violation ≠ 400). Мапить pgx/bcrypt на 401/409/500 без сырого SQL.

12. **Upload: расширение, не содержимое; лимиты только multipart.** `upload_handler.go:32–36`. `.jpg` с другим телом, нет проверки image vs video vs type. Сверять MIME/magic + type.

13. **`os.MkdirAll` без проверки ошибки** (`upload.go:15`). Тихий фейл позже на Create.

14. **GetFilms глотает ошибки scan** (`films.go:34–35`: `continue`). Битые строки пропадают. Плюс нет `rows.Err()`. Несколько карточек на фильм → дубли из JOIN.

15. **GetRelease помечен «ПЕРЕДЕЛАТь»** (`releases.go:9–23`). Условие `(season=$3 OR seasonId IS NULL)` может отдать не ту серию; logo сканируется в `l.Path` и **не попадает в JSON** (`releases.go:27–28`). Для сериалов запрос неверный.

16. **`premiere_date` не пишется.** Миграция `0003:1`, INSERT фильма её не задаёт (`repository/add.go:30`) — всегда DEFAULT NOW(), дата с формы идёт только в Release. Полки «новинки» по Films будут врать.

17. **Главная не каталог.** `cinema.tsx` грузит 10 фильмов и кормит только баннер; `MovieLibrary`/`MovieRow` не подключены и недописаны. UX «нет контента» при непустой БД.

18. **Поиск на клиенте по 10 фильмам.** `searchBar.tsx:23–27` + комментарий «в дальнейшем». `getFilms` всегда `limit:10` (`api/index.ts:85–92`).

19. **Auth-состояние хрупкое.** `authed` стартует `false` (`context.tsx:8`); F5 чинится refresh в `ProtectedRoutes`. Кнопка профиля всегда «Войти» на `/login` (`profileButton.tsx:2`). Нет logout API на фронте.

20. **`Register`: `WriteHeader` до `Content-Type`** (`register_handler.go:39–41`). Заголовок может не уйти. Сначала Header, потом WriteHeader.

21. **Часть хендлеров с `context.Background()`** вместо `r.Context()` (`genres_handler.go:12`, `add_genre.go:16`). Отмена запроса не доходит до БД.

22. **Нет транзакции на register+save refresh.** Юзер может создаться без токена в БД (`auth.go:60–64`). Редко, но сессия сразу битая.

### Мелочь / долг

23. Ошибки `json.NewEncoder(...).Encode` и `godotenv.Load()` игнорируются.

24. `GetFilms` требует `limit`, иначе 400 (`films_handler.go:13–16`) — без дефолта.

25. ILIKE по имени без индекса и без trigram (`serach_filming_members.go:16–19`; файл с опечаткой в имени).

26. Нет индексов на `FilmFilmingMembers(filmId)`, `Users.mail`.

27. `idx_userRecomendations_user` на `user_ID` (`0002:56`) — работает за счёт fold, стиль кривой; опечатка `recomendations` везде.

28. `Materials.durationSeconds` есть в README, в миграции нет.

29. `User.Password` в JSON-тегах модели (`types.go:11`) — риск отдать хеш, если когда-нибудь заэнкодят User.

30. `service.Logout*` мёртвые без роутов.

31. Зависимости `redis`, `gorilla/websocket` в go.mod, в коде не используются.

32. Фронт: `pages/add/add.tsx` мёртв (редирект `/add` → админка), но `createFilm(film)` с типом `Film` вместо `CreateFilmRequest` (`add.tsx:34–43`). `Logo.tsx:5` ведёт на `/add`. Роуты `/films`, `/series`, `/password/forgot` нигде не объявлены.

33. `movie_library.tsx:6` вызывает `getFilms` без импорта, нет `return` — модуль не компилируется, если его импортировать. `movie_row.tsx:8–10` пустой компонент.

34. `cinema.tsx:3` импорт `FilmCard` не используется.

35. Баннер: интервал при `films.length === 0` даст `% 0` (`banner.tsx:37–38`); кнопки «Смотреть» без навигации (`banner.tsx:104–109`).

36. `User` на фронте с `password` (`types/index.ts:91–99`). Почти все поля Film `| null` — следствие дырявого API, не строгой модели.

37. `FileDropzone` — клик, не drag-and-drop, несмотря на имя.

38. `membersPage` debounce: при query из 1 символа API 400, UI «никого не найдено».

39. CORS захардкожен (`cors.go:7`).

40. Нет тестов, CI, `/healthz`, slog (как в чеклисте README фазы 0).

---

## 5. Незаконченное

TODO/FIXME строк в `.go/.ts/.tsx` нет. Есть явные обрывы и заготовки:

| Что | Где |
|---|---|
| Плеер-заглушка | `player.tsx:1–2` |
| Полки recsys закомментированы, репозитория нет | `admin_shelf.go`, `get_shelf.go`; роут отсутствует |
| `GetRelease` «ПЕРЕДЕЛАТь» | `repository/releases.go:9` |
| Поиск «потом» | `searchBar.tsx:6,26` |
| Админка: нет edit/delete | `catalogPage.tsx:111–114` |
| MovieLibrary/MovieRow оборваны | `movie_library.tsx`, `movie_row.tsx` |
| Старая форма add + JWT в комментарии | `pages/add/add.tsx` |
| Logout без HTTP | `service/auth.go:100–106` |
| Схема без кода: WatchHistories, Subscriptions, Groups, Feedback, factors, events, shelves | `0001`, `0002` |
| План README vs код: Redis, HLS, WS, email, trigram, `/api/home`, `/api/events` | `README.md` фазы 1–6 |
| `is_serial` в форме есть, сезоны при add не создаются | `adminFilmPage.tsx:235` vs `repository/add.go:76` |
| Навигация на несуществующие страницы | `navigation.tsx:4–6` |
| queries.txt | ручной сид, не миграция |

Незакоммиченное на момент аудита: `admin_shelf.go`, `get_shelf.go`, `models/recSystem.go`, правки `models/movie.go` — начало полок, не доведённое до SQL/роута.

---

## 6. С чего возвращаться (приоритет)

1. **Запустить локально и сверить правду.** `.env` (`DB_URL`, `JWT_SECRET`, `GEMINI_API_KEY`), Postgres **с pgvector**, миграции 0001–0003, `GET /api/films` после логина. Compose в текущем виде, скорее всего, не поднимется как есть — не чинить «всё», а зафиксировать рабочий dev-способ.

2. **Закрыть дыры доступа, не трогая фичи.** Роль админа на мутации каталога; не раздавать `/uploads` анонимно; выкинуть секреты/JWT из репо; запрет пустого JWT secret. Иначе любая следующая фича строится на дырявом контуре.

3. **Добить вертикаль «каталог на главной».** Сейчас данные в БД есть, ряды нет (`cinema.tsx` + мёртвые `MovieLibrary`/`MovieRow`). Один список/полка из уже существующего `GET /api/films` (пагинация как в админке) — самый быстрый видимый прогресс.

4. **Не начинать SGD/полки, пока нет событий и чтения вектора.** Схема recsys уже есть; кода нет. Минимальный осмысленный шаг: либо `ORDER BY embedding <=> $1` «похожие», либо SQL-полка новинок по **реально заполняемой** дате (сейчас `premiere_date` не из формы). Комментированный `GetShelf` без repository не собирать.

5. **Плеер как следующий продукт-шаг, не HLS сразу.** Заглушка `player.tsx`; `GetRelease` отдаёт `material` path. Сначала `<video src>` + query `?id=` из `searchBar.tsx:30`, починить GetRelease. HLS/ключи — после того, как вообще что-то играет.

Не предлагаю патчи в этом файле: только направление, как просил.
