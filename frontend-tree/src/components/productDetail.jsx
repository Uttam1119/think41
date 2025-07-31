import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error('Error fetching product:', err));
  }, [id]);

  if (!product) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6">Product Details</h2>
      <table className="table-auto w-full border border-gray-300">
        <tbody>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">ID</td>
            <td className="p-3">{product.id}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">Name</td>
            <td className="p-3">{product.name}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">Brand</td>
            <td className="p-3">{product.brand}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">Category</td>
            <td className="p-3">{product.category}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">Department</td>
            <td className="p-3">{product.department}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">Cost</td>
            <td className="p-3">₹{parseFloat(product.cost).toFixed(2)}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">Retail Price</td>
            <td className="p-3">₹{parseFloat(product.retail_price).toFixed(2)}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">SKU</td>
            <td className="p-3">{product.sku}</td>
          </tr>
          <tr className="border-t">
            <td className="p-3 font-semibold bg-gray-100">Distribution Center ID</td>
            <td className="p-3">{product.distribution_center_id}</td>
          </tr>
        </tbody>
      </table>

      <Link to="/" className="inline-block mt-6 text-blue-600 hover:underline">
        ← Back to Products
      </Link>
    </div>
  );
};

export default ProductDetail;
