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
    const result = await pool.query(`SELECT 
        p.id,
        p.name,
        p.brand,
        p.retail_price,
        p.cost,
        p.sku,
        p.category,
        p.distribution_center_id,
        d.name AS department
      FROM products p
      LEFT JOIN departments d ON p.department_id = d.id`); // Add pagination later
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

app.get('/api/departments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id, 
        d.name, 
        COUNT(p.id) AS product_count
      FROM departments d
      LEFT JOIN products p ON d.id = p.department_id
      GROUP BY d.id, d.name

    `);
    res.json({ departments: result.rows });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching department by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/departments/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT 
  d.name AS department,
  COALESCE(json_agg(
    json_build_object(
      'id', p.id,
      'name', p.name,
      'brand', p.brand,
      'retail_price', p.retail_price,
      'cost', p.cost,
      'sku', p.sku,
      'category', p.category,
      'distribution_center_id', p.distribution_center_id
    )
  ) FILTER (WHERE p.id IS NOT NULL), '[]') AS products
FROM departments d
LEFT JOIN products p ON d.id = p.department_id
WHERE d.id = id
GROUP BY d.name;


    `
      [id]
    );

    res.json({ products: result.rows });
  } catch (err) {
    console.error('Error fetching products for department:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// route: /api/departments/name/:name
app.get('/api/departments/name/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const query = `
      SELECT 
        d.name AS department,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'brand', p.brand,
            'retail_price', p.retail_price,
            'cost', p.cost,
            'sku', p.sku,
            'category', p.category,
            'distribution_center_id', p.distribution_center_id
          )
        ) AS products
      FROM departments d
      JOIN products p ON d.id = p.department_id
      WHERE LOWER(d.name) = LOWER($1)
      GROUP BY d.name;
    `;

    const result = await pool.query(query, [name]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching products by department name:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
