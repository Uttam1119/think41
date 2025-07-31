const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
// const { Pool } = require('pg');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
require('dotenv').config();


const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB,
  ssl: { rejectUnauthorized: false },
});


// Upload CSV and load into DB
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const product of results) {
        const query = `
          INSERT INTO products
            (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING;
        `;

        const values = [
          parseInt(product.id),
          parseFloat(product.cost),
          product.category,
          product.name,
          product.brand,
          parseFloat(product.retail_price),
          product.department,
          product.sku,
          parseInt(product.distribution_center_id)
        ];

        await pool.query(query, values);
      }

      res.send('CSV data uploaded successfully');
    });
});


app.get('/products', async (req, res) => {
  const { department } = req.query;
  const query = department ? 
    'SELECT * FROM products WHERE department = $1' : 
    'SELECT * FROM products';
  const values = department ? [department] : [];
  const result = await pool.query(query, values);
  res.json(result.rows);
});

app.get('/departments', async (req, res) => {
  const result = await pool.query('SELECT DISTINCT department FROM products');
  res.json(result.rows);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});