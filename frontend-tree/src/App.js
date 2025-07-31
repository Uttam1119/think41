import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from './components/productList';
import ProductDetail from './components/productDetail';
import DepartmentList from "./components/departmentList";
import DepartmentPage from "./components/departmentPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Product Catalog</h1>
         {/* <DepartmentList /> */}
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/departments" element={<DepartmentList/>} />
          <Route path="/departments/:name" element={<DepartmentPage />} />
        </Routes>
      </div>
    </Router>
  );
}
