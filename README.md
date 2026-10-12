# Smart Traffic Challan and Parking Management System

A college project: an admin dashboard to manage traffic challans and parking.

* **Frontend:** React 18 + Vite, plain responsive CSS (no UI library, hand-made SVG charts)
* **Backend:** Java 21, Spring Boot 3.3, Spring Data JPA, Bean Validation, Maven
* **Database:** MySQL 8
* **Communication:** REST + JSON

Features: dashboard with summary cards and charts; challan create, view, search, filter, edit, delete and mark paid; parking slot management, vehicle entry and exit with automatic charge; three reports with a print option.

> Honest status: when this project was generated, Maven and npm could not be run (no internet in that environment). The Java code was syntax-checked and the billing and plate logic was run, but the full Spring build, the test suite and the React build were **not** executed. Section 8 explains what that means for you.

---

## 1. Install the tools (Windows, one time)

| Tool | Where to get it | Check in a new Command Prompt |
|---|---|---|
| JDK 21 | adoptium.net (Temurin 21, tick "Set JAVA_HOME") | `java -version` shows 21 |
| Maven 3.9+ | maven.apache.org/download.cgi, unzip, add its `bin` folder to PATH | `mvn -version` |
| Node.js LTS | nodejs.org | `node -v` and `npm -v` |
| MySQL 8 | dev.mysql.com/downloads/installer (choose "Server only" or "Developer Default"). Remember the **root password** you set | the "MySQL80" service is Running |

Tip: IntelliJ IDEA bundles Maven, so if you use IntelliJ you can skip installing Maven separately.

## 2. Configure the database password (never commit this)

1. Open the `backend` folder.
2. Copy `.env.example` to a new file named `.env` (in the same folder).
3. Open `.env` in Notepad and put your real MySQL password after `DB_PASSWORD=`.

The database `traffic_db` and its tables are created automatically. Demo data is inserted on the first start when the database is empty.

## 3. Start the backend

Open Command Prompt in the `backend` folder:
```
mvn spring-boot:run
```
The first run downloads libraries (a few minutes). Wait for `Started TrafficApplication`. Test it: open http://localhost:8080/api/dashboard/summary in the browser, you should see JSON. Leave this window open.

## 4. Start the frontend

Open a **second** Command Prompt in the `frontend` folder:
```
npm install
npm run dev
```
Open http://localhost:5173. The Vite dev server forwards `/api` requests to the backend, so no extra setup is needed.

## 5. Use the project

* **Dashboard:** six summary cards, charts for challan status, parking occupancy, top violations and monthly fines.
* **Challans:** search by vehicle number (partial is fine), filter by status and violation, add, edit, delete, or press Mark paid.
* **Parking:** see free and occupied slots, add or edit slots, register entry (pick a free slot), record exit (shows the charge), view who is parked and the history.
* **Reports:** challans by status, fine collection, parking occupancy. Use "Print / Save as PDF".

Parking charge: hourly rate x hours, rounded up, minimum 1 hour (car 30, bike 10, EV 40 per hour, editable in `backend/src/main/resources/application.properties`).

## 6. Run the tests

```
cd backend
mvn test
```
Tests use an in-memory H2 database, so MySQL is not needed. They cover the charge calculation, vehicle-number handling, challan CRUD, search and validation, and the parking entry and exit rules.

## 7. API documentation

With the backend running: http://localhost:8080/swagger-ui.html. A written reference is in `docs/API.md`. The design is explained in `docs/ARCHITECTURE.md`.

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| `Access denied for user 'root'` | The password in `backend\.env` is wrong. Fix it and restart |
| `Communications link failure` | MySQL is not running. Start the MySQL80 service (Services app) |
| `release version 21 not supported` or `invalid target release` | Maven is using an older Java. Install JDK 21 and check `JAVA_HOME` |
| `mvn` is not recognised | Maven's `bin` folder is not on PATH. Reopen Command Prompt after adding it |
| Port 8080 or 5173 already in use | Close the other program, or change `server.port` / the Vite `port` |
| Page says "Cannot reach the server" | The backend is not running, or is still starting |
| Want fresh demo data | In MySQL run `DROP DATABASE traffic_db;` then restart the backend |
| Do not want demo data | Add `SEED_DEMO_DATA=false` to `backend\.env` |
| A compile or build error appears | Because the full build was not run when this was generated, a small typo is possible. Copy the exact error message and ask for a fix |

## 9. Folder structure

```
backend/   Spring Boot (controller > service > repository > model, plus dto, exception, config, util)
frontend/  React app (pages, components, api.js, hooks.js, styles.css)
database/  schema.sql (reference only)
docs/      API.md and ARCHITECTURE.md
```

## 10. Security notes

* No secrets are in the repository. Database credentials come from environment variables or the git-ignored `backend/.env`.
* All input is validated on the server; SQL is generated by JPA with bound parameters; React escapes text it renders.
* This demo has **no login**. For real use, add Spring Security and roles before exposing it.
