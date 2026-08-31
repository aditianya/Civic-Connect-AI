import Navbar from "../components/Navbar";
import OperationsConsole from "../components/OperationsConsole";

function Dashboard() {
  return (
    <>
      <Navbar />

      <main className="dashboard">

        <section className="hero">
          <div className="hero__media"></div>

          <div className="hero__content">
            <p className="eyebrow">Community Hero</p>

            <h1>CivicMind AI</h1>

            <p className="hero__lede">
              An AI-powered community operating system for turning
              citizen reports into coordinated, predictive city action.
            </p>

            <div className="hero__actions">
              <a
                className="button button--primary"
                href="#operations"
              >
                Open live console
              </a>

              <a
                className="button button--ghost"
                href="#impact"
              >
                View impact
              </a>
            </div>
          </div>
        </section>
        <section className="metrics" id="impact">
  <article>
    <strong>1,284</strong>
    <span>AI-detected reports</span>
  </article>

  <article>
    <strong>412</strong>
    <span>Duplicates merged</span>
  </article>

  <article>
    <strong>37%</strong>
    <span>Faster response routing</span>
  </article>

  <article>
    <strong>18</strong>
    <span>Future hot zones flagged</span>
  </article>
        </section>
        <OperationsConsole />
      </main>
    </>
  );
}

export default Dashboard;