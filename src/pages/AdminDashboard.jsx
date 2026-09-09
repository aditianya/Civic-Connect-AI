import { useEffect, useState } from "react";
import {collection,onSnapshot,doc,updateDoc,} from "firebase/firestore";
import { db } from "../services/firebase";

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("All");

  // Count pending reports
  const pendingReports = reports.filter(
    (report) => report.status === "Pending"
  ).length;

  // Count resolved reports
  const resolvedReports = reports.filter(
    (report) => report.status === "Resolved"
  ).length;

  // Filter reports
  const filteredReports =filter === "All"? reports: reports.filter((report) => report.status === filter);

  // Get real-time reports from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        const reportData = snapshot.docs.map((doc) => ({
          id: doc.id,...doc.data(),}));
        setReports(reportData);
      }
    );
    // Stop listening when component is removed
    return () => unsubscribe();
  }, []);
  // Update report status
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
      {/* Metrics */}
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
      {/* Report Filters */}
      <div className="report-filters">
        <button onClick={() => setFilter("All")}>All</button>
        <button onClick={() => setFilter("Pending")}>Pending </button>
        <button onClick={() => setFilter("In Progress")}>In Progress</button>
        <button onClick={() => setFilter("Resolved")}>Resolved</button>
      </div>

      {/* Reports */}
      {filteredReports.map((report) => (
        <div className="report-card" key={report.id}>
          <h3>{report.title}</h3>
          {report.imageUrl && (<img src={report.imageUrl}
    alt={report.title}
    className="report-image"
  />
)}

          <p>{report.description}</p>
          <p>
            Category: {report.category}
          </p>
          <p>
            Location: {report.location}
          </p>
          {report.aiProcessed && (
      <div className="admin-ai-analysis">
        <h3>🤖 AI Analysis</h3>

    <p>
      <strong>Suggested Issue:</strong>{" "}
      {report.aiSuggestedTitle}
    </p>

    <p>
      <strong>AI Category:</strong>{" "}
      {report.aiCategory}
    </p>

    <p>
      <strong>AI Severity:</strong>{" "}
      {report.aiSeverity}
    </p>

    <p>
      <strong>AI Explanation:</strong>{" "}
      {report.aiExplanation}
    </p>
    <p>
  <strong>Priority:</strong>{" "}
  {report.aiPriority}
</p>

<p>
  <strong>Department:</strong>{" "}
  {report.aiDepartment}
</p>

<p>
  <strong>Recommended Action:</strong>{" "}
  {report.aiRecommendedAction}
</p>

<p>
  <strong>Estimated Response Time:</strong>{" "}
  {report.aiEstimatedResponseTime}
</p>

  </div>
)}
          <p>
            Status:{" "}
            <span
              className={`status-badge ${
                report.status
                  ?.toLowerCase()
                  .replace(" ", "-")
              }`}
            >
              {report.status}
            </span>
          </p>
          <button
            onClick={() =>
              updateStatus(report.id, "In Progress")
            }
          >
            Mark In Progress
          </button>

          <button
            onClick={() =>
              updateStatus(report.id, "Resolved")
            }
          >
            Mark Resolved
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;