const steps = [
  ["01", "Report", "Submit a civic issue with a photo and location."],
  ["02", "AI Analyses", "AI categorizes the issue and evaluates severity."],
  ["03", "Authority Acts", "The complaint reaches the appropriate authority."],
  ["04", "Resolved", "Track the progress until the issue is resolved."]
];

function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>How CivicConnectAI Works</h2>

      <div className="steps">
        {steps.map(([number, title, description]) => (
          <div className="step" key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;