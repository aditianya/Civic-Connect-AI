import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const pendingReports = reports.filter(
  (report) => report.status === "Pending"
).length;

  const resolvedReports = reports.filter(
  (report) => report.status === "Resolved"
).length;

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

  const updateStatus = async (id, newStatus) => {
  try {
    await updateDoc(doc(db, "reports", id), {
      status: newStatus,
    });

    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id
          ? { ...report, status: newStatus }
          : report
      )
    );
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-metrics">
        <div className="metric-card">
          <h3>Total Reports</h3>
          <p>{reports.length}</p>
        </div>

        <div className="metric-card">
          <h3>Pending</h3>
          <p>{pendingReports}</p>
        </div>

        <div className="metric-card">
          <h3>Resolved</h3>
          <p>{resolvedReports}</p>
        </div>
      </div>

    {reports.map((report) => (
        <div className="report-card" key={report.id}>
          <h3>{report.title}</h3>
          <p>{report.description}</p>
          <p>Category: {report.category}</p>
          <p>Location: {report.location}</p>
          <p>Status:<span className={`status-badge ${report.status?.toLowerCase().replace(" ", "-")}`}>{report.status}</span></p>

        <button onClick={() => updateStatus(report.id, "In Progress")}>
           Mark In Progress
        </button>

        <button onClick={() => updateStatus(report.id, "Resolved")}>
          Mark Resolved
        </button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;