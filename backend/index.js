// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const csvParser = require('csv-parser');
// const fs = require('fs');
// // const { Pool } = require('pg');
// const app = express();
// const port = 5000;

// app.use(cors());
// app.use(express.json());
// require('dotenv').config();


// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DB,
//   ssl: { rejectUnauthorized: false },
// });


// // Upload CSV and load into DB
// const upload = multer({ dest: 'uploads/' });

// app.post('/upload', upload.single('file'), (req, res) => {
//   const results = [];

//   fs.createReadStream(req.file.path)
//     .pipe(csvParser())
//     .on('data', (data) => results.push(data))
//     .on('end', async () => {
//       for (const product of results) {
//         const query = `
//           INSERT INTO products
//             (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id)
//           VALUES
//             ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//           ON CONFLICT (id) DO NOTHING;
//         `;

//         const values = [
//           parseInt(product.id),
//           parseFloat(product.cost),
//           product.category,
//           product.name,
//           product.brand,
//           parseFloat(product.retail_price),
//           product.department,
//           product.sku,
//           parseInt(product.distribution_center_id)
//         ];

//         await pool.query(query, values);
//       }

//       res.send('CSV data uploaded successfully');
//     });
// });


// app.get('/products', async (req, res) => {
//   const { department } = req.query;
//   const query = department ? 
//     'SELECT * FROM products WHERE department = $1' : 
//     'SELECT * FROM products';
//   const values = department ? [department] : [];
//   const result = await pool.query(query, values);
//   res.json(result.rows);
// });

// app.get('/departments', async (req, res) => {
//   const result = await pool.query('SELECT DISTINCT department FROM products');
//   res.json(result.rows);
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL setup
const pool = new pg.Pool({
  connectionString: process.env.DB,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products LIMIT 100'); // Add pagination later
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Only for dev: Upload CSV data via Postman
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;

  const client = await pool.connect();
  try {
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream) {
      // Clean & validate data
      const {
        id,
        cost,
        category = 'Uncategorized',
        name,
        brand = 'Unknown',
        retail_price,
        department = 'General',
        sku,
        distribution_center_id
      } = row;

      if (!id || !name || !sku || isNaN(cost) || isNaN(retail_price)) continue;

      await client.query(
        `INSERT INTO products (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [id, cost, category.trim(), name.trim(), brand.trim(), retail_price, department.trim(), sku.trim(), distribution_center_id]
      );
    }

    res.status(200).json({ message: 'CSV data uploaded successfully' });
  } catch (err) {
    console.error('Error uploading CSV:', err);
    res.status(500).json({ error: 'Upload failed' });
  } finally {
    client.release();
    fs.unlinkSync(filePath);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
