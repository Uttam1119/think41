import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DepartmentProducts() {
  const { name } = useParams();
  const [departmentData, setDepartmentData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/departments/name/${name}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched department data:", data);
        setDepartmentData(data);
      })
      .catch((err) => console.error("Error fetching department products:", err));
  }, [name]);

  if (!departmentData) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {departmentData.department} ({departmentData.products.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departmentData.products.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow-sm">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p>Brand: {product.brand}</p>
            <p>Retail Price: ₹{product.retail_price}</p>
            <p>Cost: ₹{product.cost}</p>
            <p>Category: {product.category}</p>
            <p>SKU: {product.sku}</p>
            <p>Center ID: {product.distribution_center_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
