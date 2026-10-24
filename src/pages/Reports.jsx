import Navbar from "../components/Navbar";
import CommunityReportsMap from "../components/CommunityReportsMap";

function Reports() {
  return (
    <>
      <Navbar />
      <main className="reports-page reports-live-page">
        <section className="reports-header">
          <p className="eyebrow">Live community map</p>
          <h1>See what needs attention.</h1>
          <p>Explore citizen reports as they arrive, filter by severity or status, and open a marker for report details.</p>
        </section>
        <CommunityReportsMap />
      </main>
    </>
  );
}

export default Reports;
