// components/DepartmentList.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
  fetch("http://localhost:5000/api/departments")
    .then(res => res.json())
    .then(data => {
      console.log("Fetched departments:", data); // ✅ Debug print
      if (Array.isArray(data.departments)) {
        setDepartments(data.departments);
      }
    })
    .catch(err => console.error("Error fetching departments", err));
}, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Departments</h2>
      <ul className="space-y-2">
        {departments.map((dept) => (
          <li key={dept.id}>
            <Link
              to={`/departments/${dept.name.toLowerCase()}`}
              className="text-blue-600 hover:underline"
            >
              {dept.name} ({dept.product_count})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );    
};

export default DepartmentList;
