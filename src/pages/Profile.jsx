import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { auth, db } from "../services/firebase";

function severityFor(report) {
  return String(report.severity || report.aiSeverity || "Unrated");
}

function severityClass(severity) {
  return severity.toLowerCase().replaceAll(" ", "-");
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return undefined;

    const unsubscribeProfile = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null);
      },
      () => setError("Your profile could not be loaded. Please try again.")
    );

    const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribeReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        setReports(snapshot.docs.map((report) => ({ id: report.id, ...report.data() })));
      },
      () => setError("Community reports could not be loaded. Please try again.")
    );

    return () => {
      unsubscribeProfile();
      unsubscribeReports();
    };
  }, []);

  const userReports = useMemo(
    () => reports.filter((report) => report.userId === auth.currentUser?.uid),
    [reports]
  );
  const isAdmin = profile?.role === "admin";
  const visibleReports = useMemo(() => {
    const search = locationFilter.trim().toLowerCase();
    return reports
      .filter((report) => !search || `${report.location || ""} ${report.title || ""}`.toLowerCase().includes(search))
      .slice(0, 4);
  }, [reports, locationFilter]);
  const displayName = auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Community member";

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <header className="profile-welcome">
          <div>
            <p className="eyebrow">{isAdmin ? "Civic operations" : "Citizen portal"}</p>
            <h1>Your community, in action.</h1>
            <p>Welcome back, {displayName}. Follow local issues and see what needs attention.</p>
          </div>
          <span className={`profile-role${isAdmin ? " profile-role--admin" : ""}`}>
            {isAdmin ? "Administrator" : "Citizen"}
          </span>
        </header>

        {error && <p className="form-notice form-notice--error" role="alert">{error}</p>}

        <section className="profile-account" aria-label="Account information">
          <div className="profile-avatar" aria-hidden="true">{displayName.slice(0, 1).toUpperCase()}</div>
          <div className="profile-account__details">
            <span className="profile-section-label">Signed in as</span>
            <strong>{displayName}</strong>
            <span>{auth.currentUser?.email}</span>
          </div>
          <Link className="profile-text-link" to={isAdmin ? "/admin-dashboard" : "/my-reports"}>
            {isAdmin ? "Open operations dashboard" : "View all my reports"} <span aria-hidden="true">→</span>
          </Link>
        </section>

        {isAdmin ? (
          <section className="profile-role-panel profile-role-panel--admin">
            <div className="profile-role-panel__icon" aria-hidden="true">↗</div>
            <div>
              <p className="profile-section-label">Administrator workspace</p>
              <h2>Review, route, and resolve reports</h2>
              <p>Review incoming citizen reports, check their severity, update progress, and refer issues to a higher authority or industry when local resolution is not enough.</p>
            </div>
            <Link className="button button--primary" to="/admin-dashboard">Review reports</Link>
          </section>
        ) : (
          <>
            <section className="profile-stat-grid" aria-label="Your report summary">
              <article><span>Reports submitted</span><strong>{userReports.length}</strong></article>
              <article><span>In progress</span><strong>{userReports.filter((report) => report.status === "In Progress").length}</strong></article>
              <article><span>Resolved</span><strong>{userReports.filter((report) => report.status === "Resolved").length}</strong></article>
            </section>
            <section className="profile-role-panel">
              <div className="profile-role-panel__icon" aria-hidden="true">＋</div>
              <div>
                <p className="profile-section-label">Make your neighborhood heard</p>
                <h2>Notice an issue? Report it.</h2>
                <p>Submit a description and photo. We’ll assess its severity and keep you updated as the report moves through review and resolution.</p>
              </div>
              <Link className="button button--primary" to="/report">Create a report</Link>
            </section>
            <section className="profile-my-reports">
              <div className="profile-section-heading">
                <div><p className="profile-section-label">Your activity</p><h2>Track your reports</h2></div>
                <Link className="profile-text-link" to="/my-reports">See all reports <span aria-hidden="true">→</span></Link>
              </div>
              {userReports.length ? (
                <div className="profile-activity-list">
                  {userReports.slice(0, 3).map((report) => (
                    <article key={report.id}>
                      <div><span className={`severity-tag severity-tag--${severityClass(severityFor(report))}`}>{severityFor(report)} severity</span><h3>{report.title}</h3><p>{report.category || "Community issue"}</p></div>
                      <span className={`status-badge ${(report.status || "Pending").toLowerCase().replaceAll(" ", "-")}`}>{report.status || "Pending"}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="profile-empty"><p>You haven’t submitted a report yet. When you do, you can follow its status here.</p><Link to="/report">Submit your first report →</Link></div>
              )}
            </section>
          </>
        )}

        <section className="profile-community">
          <div className="profile-section-heading">
            <div><p className="profile-section-label">Community watch</p><h2>Reports around your community</h2><p>Browse local reports and compare their assessed severity and status.</p></div>
            <Link className="profile-text-link" to="/reports">Explore all reports <span aria-hidden="true">→</span></Link>
          </div>
          <label className="profile-location-filter">
            <span>Find reports by location</span>
            <input type="search" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Try a street, area, or landmark" />
          </label>
          {visibleReports.length ? (
            <div className="profile-community-grid">
              {visibleReports.map((report) => (
                <article key={report.id} className="profile-community-card">
                  <div className="profile-community-card__meta">
                    <span>{report.category || "Community issue"}</span>
                    <span className={`severity-tag severity-tag--${severityClass(severityFor(report))}`}>{severityFor(report)}</span>
                  </div>
                  <h3>{report.title || "Untitled report"}</h3>
                  <p className="profile-community-location">{report.location || "Location not specified"}</p>
                  <span className={`status-badge ${(report.status || "Pending").toLowerCase().replaceAll(" ", "-")}`}>{report.status || "Pending"}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty"><p>{reports.length ? "No reports match that location. Try a different search." : "No community reports to show yet."}</p></div>
          )}
        </section>
      </main>
    </>
  );
}

export default Profile;
