import { useEffect, useState } from "react";
import {collection,query,where,onSnapshot,} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import Navbar from "../components/Navbar";

function MyReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const reportsQuery = query(
      collection(db, "reports"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const reportData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReports(reportData);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Navbar />

      <main className="my-reports-page">

        <section className="my-reports-header">
          <p className="eyebrow">Citizen Portal</p>

          <h1>My Reports</h1>

          <p>
            Track the civic issues you have reported
            and monitor their progress.
          </p>
        </section>

        <section className="my-reports-list">

          {reports.length === 0 ? (
            <div className="empty-reports">
              <h2>No reports yet</h2>
              <p>
                You haven't submitted any civic issues.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <article
                className="my-report-card"
                key={report.id}
              >
                <div className="my-report-top">
                  <span className="card-label">
                    {report.category}
                  </span>

                  <span
                    className={`status-badge ${
                      report.status
                        ?.toLowerCase()
                        .replace(" ", "-")
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <h2>{report.title}</h2>
                {report.imageUrl && (<img src={report.imageUrl} alt={report.title} className="report-image"/>)}
                <p>{report.description}</p>
                <p className="report-location">
                  📍 {report.location}
                </p>
                {report.aiProcessed && (
  <div className="ai-analysis">
    <h3>🤖 AI Analysis</h3>

    <p>
      <strong>Suggested Issue:</strong>{" "}
      {report.aiSuggestedTitle}
    </p>

    <p>
      <strong>Category:</strong>{" "}
      {report.aiCategory}
    </p>

    <p>
      <strong>Severity:</strong>{" "}
      {report.aiSeverity}
    </p>

    <p>
      <strong>AI Insight:</strong>{" "}
      {report.aiExplanation}
    </p>
  </div>
)}
              </article>
            ))
          )}

        </section>

      </main>
    </>
  );
}

export default MyReports;