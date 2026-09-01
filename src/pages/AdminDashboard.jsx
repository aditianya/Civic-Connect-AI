import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

function AdminDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const snapshot = await getDocs(collection(db, "reports"));

      const reportData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReports(reportData);
    };

    fetchReports();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h2>Total Reports: {reports.length}</h2>

      {reports.map((report) => (
        <div key={report.id}>
          <h3>{report.title}</h3>
          <p>{report.description}</p>
          <p>Category: {report.category}</p>
          <p>Location: {report.location}</p>
          <p>Status: {report.status}</p>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;