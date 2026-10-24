import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import Navbar from "../components/Navbar";

const statuses = ["All", "Pending", "In Progress", "Escalated", "Resolved"];

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [referralTargets, setReferralTargets] = useState({});
  useEffect(() => {
    const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    return onSnapshot(reportsQuery, (snapshot) => { setReports(snapshot.docs.map((report) => ({ id: report.id, ...report.data() }))); setError(""); }, () => setError("Reports could not be loaded. Confirm that your account has the admin role."));
  }, []);
  const metrics = useMemo(() => ({ total: reports.length, pending: reports.filter((report) => report.status === "Pending").length, resolved: reports.filter((report) => report.status === "Resolved").length }), [reports]);
  const filteredReports = filter === "All" ? reports : reports.filter((report) => report.status === filter);
  const updateStatus = async (id, status) => {
    setUpdatingId(id); setError("");
    try { await updateDoc(doc(db, "reports", id), { status, updatedAt: new Date() }); }
    catch { setError("The report status could not be updated."); }
    finally { setUpdatingId(null); }
  };
  const referReport = async (report) => {
    const escalatedTo = referralTargets[report.id] || "Higher authority";
    setUpdatingId(report.id); setError("");
    try {
      await updateDoc(doc(db, "reports", report.id), {
        status: "Escalated",
        escalatedTo,
        escalatedAt: new Date(),
        updatedAt: new Date(),
      });
    } catch {
      setError("The report could not be referred. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };
  return (
    <>
      <Navbar />
      <main className="admin-dashboard">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Restricted workspace</p>
            <h1>Operations dashboard</h1>
            <p>Review incoming reports and keep residents informed as work progresses.</p>
          </div>
          <span className="admin-role-badge">Admin access</span>
        </header>

        {error && <p className="form-notice form-notice--error" role="alert">{error}</p>}
        <section className="admin-metrics" aria-label="Report statistics">
          <article className="metric-card"><span>All reports</span><strong>{metrics.total}</strong></article>
          <article className="metric-card metric-card--pending"><span>Awaiting review</span><strong>{metrics.pending}</strong></article>
          <article className="metric-card metric-card--resolved"><span>Resolved</span><strong>{metrics.resolved}</strong></article>
        </section>

        <div className="report-filters" aria-label="Filter reports by status">
          {statuses.map((status) => (
            <button className={filter === status ? "is-active" : ""} type="button" onClick={() => setFilter(status)} key={status}>
              {status}
            </button>
          ))}
        </div>

        <section className="admin-report-list">
          {filteredReports.length ? filteredReports.map((report) => {
            const severity = String(report.aiSeverity || report.severity || "Unrated");
            const severityClass = severity.toLowerCase().replaceAll(" ", "-");
            const status = report.status || "Pending";

            return (
              <article className="admin-report-card" key={report.id}>
                <div className="admin-report-card__body">
                  <div className="admin-report-card__top">
                    <span className="report-category">{report.category || "Other"}</span>
                    <span className={`status-badge ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>
                  </div>
                  <span className={`severity-tag severity-tag--${severityClass}`}>{severity} severity</span>
                  <h2>{report.title}</h2>
                  <p>{report.description}</p>
                  <p className="report-location">Location: {report.location}</p>
                  {report.escalatedTo && <p className="admin-referral-note">Referred to: <strong>{report.escalatedTo}</strong></p>}
                  {report.imageUrl && <img src={report.imageUrl} alt={report.title} className="report-image" />}
                  {report.aiProcessed && (
                    <details className="admin-ai-analysis">
                      <summary>AI triage details</summary>
                      <dl>
                        <div><dt>Severity</dt><dd>{report.aiSeverity}</dd></div>
                        <div><dt>Priority</dt><dd>{report.aiPriority}</dd></div>
                        <div><dt>Department</dt><dd>{report.aiDepartment}</dd></div>
                        <div><dt>Recommended action</dt><dd>{report.aiRecommendedAction}</dd></div>
                      </dl>
                    </details>
                  )}
                </div>
                <div className="admin-report-actions">
                  <span>Update report</span>
                  {["In Progress", "Resolved"].map((nextStatus) => (
                    <button
                      disabled={updatingId === report.id || report.status === nextStatus}
                      type="button"
                      onClick={() => updateStatus(report.id, nextStatus)}
                      key={nextStatus}
                    >
                      {updatingId === report.id ? "Saving…" : nextStatus}
                    </button>
                  ))}
                  <label className="admin-referral-label" htmlFor={`referral-${report.id}`}>Refer issue to</label>
                  <select
                    id={`referral-${report.id}`}
                    value={referralTargets[report.id] || "Higher authority"}
                    onChange={(event) => setReferralTargets((targets) => ({ ...targets, [report.id]: event.target.value }))}
                  >
                    <option>Higher authority</option>
                    <option>Industry partner</option>
                  </select>
                  <button
                    className="admin-referral-button"
                    disabled={updatingId === report.id}
                    type="button"
                    onClick={() => referReport(report)}
                  >
                    {updatingId === report.id ? "Saving…" : "Forward report"}
                  </button>
                </div>
              </article>
            );
          }) : (
            <div className="empty-reports">
              <h2>No {filter === "All" ? "reports" : `${filter.toLowerCase()} reports`} yet</h2>
              <p>New reports will appear here in real time.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default AdminDashboard;
