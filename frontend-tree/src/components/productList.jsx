import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Product List</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-3 px-4 border">ID</th>
              <th className="py-3 px-4 border">Name</th>
              <th className="py-3 px-4 border">Brand</th>
              <th className="py-3 px-4 border">Category</th>
              <th className="py-3 px-4 border">Department</th>
              <th className="py-3 px-4 border">Cost</th>
              <th className="py-3 px-4 border">Details</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="text-center hover:bg-gray-50 transition-colors">
                <td className="py-2 px-4 border">{product.id}</td>
                <td className="py-2 px-4 border">{product.name}</td>
                <td className="py-2 px-4 border">{product.brand}</td>
                <td className="py-2 px-4 border">{product.category}</td>
                <td className="py-2 px-4 border">{product.department}</td>
                <td className="py-2 px-4 border">₹{parseFloat(product.cost).toFixed(2)}</td>
                <td className="py-2 px-4 border">
                  <Link to={`/products/${product.id}`} className="text-blue-600 hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
