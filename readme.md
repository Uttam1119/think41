
# 🛒 Full-Stack E-Commerce App

This is a full-stack e-commerce application built using:

- **Frontend**: React
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL (hosted on NeonDB)
- **CSV Upload Support**: Products imported from `products.csv`

---

## 📁 Folder Structure



/backend         → Express + PostgreSQL logic
/frontend-tree        → React UI
/backend/products.csv    → Product data to import
/backend/.env            → Environment variables





## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Uttam1119/think41
cd think41
````

---

### 2. Backend Setup

#### 📦 Install Dependencies

```bash
cd backend
npm install
```

#### 🛠️ Configure Environment

Create a `.env` file inside the `/backend` folder:

```env
DATABASE_URL=your_postgresql_connection_string
PORT=5000
```

You can use [NeonDB](https://neon.tech/) to host PostgreSQL and get your `DATABASE_URL`.

#### 🧬 Initialize the Database

Run the SQL below to create the `products` table:

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  cost NUMERIC,
  category TEXT,
  name TEXT,
  brand TEXT,
  retail_price NUMERIC,
  department TEXT,
  sku TEXT,
  distribution_center_id INTEGER
);
```

You can run this query using:

* NeonDB Console
* `psql` CLI
* or via a Node.js script

#### 📤 Upload CSV Data

Make sure `products.csv` is in the `/backend` folder. Then, run:

```bash
node loadCSV.js
```

This will parse and import all products into the `products` table.

#### ▶️ Start the Server

```bash
npm start
```

Your backend will run on [http://localhost:5000](http://localhost:5000)

---

### 3. Frontend Setup

```bash
cd ../frontend-tree
npm install
npm start
```

The React frontend will run on [http://localhost:3000](http://localhost:3000)

---

## ✅ Features Completed

* ✅ Upload and store products from CSV into PostgreSQL
* ✅ REST API server with Node.js & Express
* ✅ PostgreSQL setup using NeonDB
* ✅ Initial frontend with React

---

## 📄 products.csv Schema

| Column                   | Description                       |
| ------------------------ | --------------------------------- |
| id                       | Unique identifier                 |
| cost                     | Cost of the product               |
| category                 | Category the product belongs to   |
| name                     | Name of the product               |
| brand                    | Brand name                        |
| retail\_price            | Retail price                      |
| department               | Department the product belongs to |
| sku                      | Stock Keeping Unit                |
| distribution\_center\_id | Related distribution center ID    |

---
