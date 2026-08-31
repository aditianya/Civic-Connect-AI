import { Link } from "react-router-dom";
function OperationsConsole() {
  return (
    <section className="operations" id="operations">

      {/* Section heading */}
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live Operations</p>
          <h2>Community issue console</h2>
        </div>

        <p>
          Track incoming reports, identify problem zones,
          and coordinate civic action.
        </p>
      </div>

      {/* Three operation cards */}
      <div className="operations-grid">

        {/* Issue Intake */}
        <article className="operation-card">
          <p className="card-label">01 · Issue Intake</p>

          <h3>Report a civic issue</h3>

          <p>
            Capture problems reported by citizens
            and send them for AI analysis.
          </p>

          <Link
  to="/report"
  className="button button--primary"
>
  Report an issue
</Link>
        </article>

        {/* Problem Zones */}
        <article className="operation-card">
          <p className="card-label">02 · Problem Zones</p>

          <h3>Hotspot detection</h3>

          <p>
            Identify locations where multiple
            civic issues are being reported.
          </p>

          <div className="zone">
            <span>Main Road</span>
            <strong>12 reports</strong>
          </div>

          <div className="zone">
            <span>Market Area</span>
            <strong>8 reports</strong>
          </div>
        </article>

        {/* Action Queue */}
        <article className="operation-card">
          <p className="card-label">03 · Action Queue</p>

          <h3>Priority actions</h3>

          <p>
            Review issues that require immediate
            attention from authorities.
          </p>

          <div className="action-item">
            <span>Water leakage</span>
            <strong className="priority-high">HIGH</strong>
          </div>

          <div className="action-item">
            <span>Garbage collection</span>
            <strong className="priority-medium">MEDIUM</strong>
          </div>

          <div className="action-item">
            <span>Streetlight</span>
            <strong className="priority-low">LOW</strong>
          </div>
        </article>

      </div>

    </section>
  );
}

export default OperationsConsole;