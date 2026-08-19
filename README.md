# PineappleAI POS Web

PineappleAI POS is a web-based point-of-sale system for managing products, stock attributes, prices, barcodes, customers, orders, sales, cashiers, business details and notifications.

The repository contains two applications:

- `backend`: Node.js REST API and Socket.IO server.
- `Frontend`: React web application used by POS operators and administrators.

## System Overview

```text
React Frontend
      |
      | REST/JSON, JWT Authorization
      v
Express Backend ---- Socket.IO (real-time notifications)
      |
      +---- Sequelize/MySQL
      +---- MySQL raw connection pool
      +---- Email, SMS and Google authentication integrations
```

### Main Technologies

| Area | Technology | Purpose |
| --- | --- | --- |
| Frontend | React 19, React Router 6 | POS screens, navigation and UI |
| Frontend API | Axios and Fetch | Calling backend endpoints |
| Backend | Node.js, Express 4 | REST API and middleware |
| Database | MySQL, Sequelize, mysql2 | Persistent POS data and database initialization |
| Authentication | JWT, bcrypt, Google Auth Library | Login, token validation, password security and Google login |
| Real-time | Socket.IO | Business-scoped notifications and unread-count updates |
| Documents | PDFKit, html2pdf.js, json2csv | Bills, PDF exports and sales CSV exports |
| Barcode | bwip-js, JsBarcode, canvas | Barcode generation and barcode images |
| Messaging | Nodemailer and SMS service | Email bills, OTPs and notifications |

## Folder Structure

```text
PineappleAI POS WEB/
|-- README.md
|-- backend/
|   |-- server.js                 # Express and Socket.IO entry point
|   |-- package.json
|   |-- config/                   # Database, API and Socket.IO configuration
|   |-- Controllers/              # Business logic for each feature
|   |-- middlewares/              # JWT auth and request validation
|   |-- models/                   # Sequelize/data-access models
|   |-- routes/                   # REST endpoint definitions
|   |-- services/                 # Shared services such as bills and SMS
|   |-- validators/               # Input validation rules
|   |-- database/                 # Schema checks and migration utilities
|   |-- public/barcodes/          # Generated barcode assets
|   |-- seeders/                  # Seed data
|   `-- test/                     # Backend verification scripts/tests
`-- Frontend/
    |-- package.json
    |-- public/                   # Static public assets
    |-- src/
    |   |-- components/           # Reusable UI components, including layout
    |   |-- pages/                # POS and management screens
    |   |-- integration/          # Feature-wise API clients
    |   |-- routes/               # React route definitions
    |   |-- contexts/             # Shared React state/providers
    |   |-- models/               # Frontend data/form models
    |   |-- config/               # Frontend API configuration
    |   |-- styles/               # Feature styles
    |   `-- App.js                # Application entry component
    `-- build/                    # Production build output
```

## Backend API

The backend runs on port `5000` by default. All application endpoints are mounted under `/api` unless noted otherwise.

| Base path | Main use |
| --- | --- |
| `/api/auth` | Login, refresh token, logout, password reset OTP and Google token verification |
| `/api/register` | New user/business registration |
| `/api/verify` | Phone/email OTP and access-key verification |
| `/api/products` | Product creation, editing, deletion, details, pricing and barcode image retrieval |
| `/api/products?name=...` | Authenticated product search |
| `/api/categories` | Category CRUD and category search |
| `/api/product-categories` | Product-category listing and creation |
| `/api/sizes` | Size CRUD |
| `/api/colors` | Color CRUD |
| `/api/prices` | Price creation and price listing |
| `/api/barcodes` | Barcode creation, listing and deletion |
| `/api/barcode-search` | Find product details by barcode number |
| `/api/attributes` and `/api/categories/:id/attributes` | Custom category/product attributes and values |
| `/api/customers` | Customer create, list, update and delete |
| `/api/searchcustomers` | Customer search by query |
| `/api/orders` | Create orders, retrieve bills and resend bills by email |
| `/api/public/bills/:order_no` | Public bill viewing without the normal POS screen |
| `/api/sales` | Sales statistics and CSV download |
| `/api/dashboard` | Dashboard statistics |
| `/api/cashier` | Cashier/business management |
| `/api/profile` | Current user profile |
| `/api/shops` | Shop listing and approval/status management |
| `/api/business-details` | Business information lookup |
| `/api/notifications` | List notifications, unread count and mark-as-read actions |
| `/api/account` | Authenticated account deletion |
| `/api/system-info` | Runtime database host/name, environment, port, version and timestamp |

### Frequently Used Endpoints

```text
POST   /api/auth/login
POST   /api/register
GET    /api/products?name=product-name
POST   /api/products/add-product
PUT    /api/products/update-product/:id
POST   /api/products/add-pricing
GET    /api/barcode-search/barcodes/search/:barcodeNo
POST   /api/customers/create
GET    /api/searchcustomers/customers/search?query=value
POST   /api/orders/create-order
GET    /api/orders/bills/:order_no
GET    /api/sales/stats
GET    /api/dashboard/stats
GET    /api/notifications/unread-count
GET    /api/system-info
```

## Authentication and Data Flow

1. The frontend reads its API host from `REACT_APP_API_URL`; the current fallback is `https://pos-web-dev.pineappleai.cloud`.
2. The user logs in through `/api/auth/login` and receives a JWT/access token.
3. Protected requests send `Authorization: Bearer <token>`.
4. `authMiddleware` verifies `JWT_SECRET`, attaches user, role and business information to the request, and blocks requests without a valid business context for non-admin users.
5. Product, customer, cashier, order and sales screens call feature-specific clients in `Frontend/src/integration`.
6. Socket.IO connections also require a JWT and join a `business_<business_id>` room so notifications stay within the correct business.

## Environment Configuration

Create `backend/.env` locally. Do not commit it.

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=pos_dev
DB_DIALECT=mysql
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
NOTIFY_USER_ID=your_sms_user_id
NOTIFY_API_KEY=your_sms_api_key
NOTIFY_SENDER_ID=your_sender_id
```

For the frontend, create `Frontend/.env` when using a different backend:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Running Locally

### Backend

```bash
cd backend
npm install
npm start
```

The API is available at `http://localhost:5000` and the health response is available at `GET /`.

### Frontend

```bash
cd Frontend
npm install
npm start
```

The React development server normally runs at `http://localhost:3000`.

### Production Build

```bash
cd Frontend
npm run build
```

## Database Notes

- Sequelize uses MySQL and maps timestamps to `created_at` and `updated_at`.
- The raw MySQL pool in `backend/config/database.js` verifies the connection and initializes custom attribute tables when the server starts.
- Database utilities such as schema checks, migration helpers and inventory scans are in `backend/database`.
- The default local fallback database is `pos_dev`; use `.env` values for the real environment.

## Real-time Notifications

Socket.IO is initialized by the backend HTTP server. Clients authenticate with the JWT in the handshake. The server currently emits:

- `new_notification`
- `unread_count_update`

The `ping` event returns `pong` and can be used to verify that the Socket.IO connection is active.

## System Information

Use `GET /api/system-info` to verify the running server configuration. It returns the database name, database host, Node environment, server port, backend version and response timestamp. This endpoint is intended for debugging and environment verification; avoid exposing it publicly in a production deployment unless required.

## Important Security Notes

- Keep `.env`, database passwords, JWT secrets, email credentials and SMS keys outside source control.
- Use HTTPS for deployed frontend and API traffic.
- Treat JWTs as secrets and never log them.
- Review the CORS origin list in `backend/server.js` when adding or removing deployment environments.
- The `/api/system-info` response reveals deployment metadata and should be access-controlled if the API is internet-facing.
