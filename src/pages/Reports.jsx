import Navbar from "../components/Navbar";

function Reports() {
  const reports = [
    {
      id: 1,
      title: "Large pothole near main gate",
      category: "Roads",
      location: "Main Road",
      priority: "HIGH",
      status: "Pending",
    },
    {
      id: 2,
      title: "Garbage piling up near market",
      category: "Waste Management",
      location: "Market Area",
      priority: "MEDIUM",
      status: "Assigned",
    },
    {
      id: 3,
      title: "Streetlight not working",
      category: "Streetlights",
      location: "Station Road",
      priority: "LOW",
      status: "Resolved",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="reports-page">

        <section className="reports-header">
          <p className="eyebrow">Issue Management</p>

          <h1>Community reports</h1>

          <p>
            Review civic issues reported by citizens
            and track their current status.
          </p>
        </section>

        <section className="reports-list">

          {reports.map((report) => (
            <article
              className="report-card"
              key={report.id}
            >
              <div className="report-card-top">
                <span className="card-label">
                  {report.category}
                </span>

                <span
                  className={`priority priority-${report.priority.toLowerCase()}`}
                >
                  {report.priority}
                </span>
              </div>

              <h2>{report.title}</h2>

              <p className="report-location">
                📍 {report.location}
              </p>

              <div className="report-card-bottom">
                Status: <strong>{report.status}</strong>
              </div>
            </article>
          ))}

        </section>

      </main>
    </>
  );
}

export default Reports;