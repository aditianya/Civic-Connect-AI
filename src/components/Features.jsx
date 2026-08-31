const features = [
  {
    icon: "🚧",
    title: "Report Issues",
    description: "Report potholes, garbage, broken lights and other civic problems."
  },
  {
    icon: "🤖",
    title: "AI Analysis",
    description: "AI automatically identifies the issue and determines its severity."
  },
  {
    icon: "📍",
    title: "Track on Map",
    description: "See reported issues and their status on an interactive map."
  },
  {
    icon: "✅",
    title: "Get Resolution",
    description: "Track your complaint from submission to resolution."
  }
];

function Features() {
  return (
    <section className="features">
      <h2>Everything You Need</h2>

      <div className="feature-grid">
        {features.map((feature) => (
          <div className="feature-card" key={feature.title}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;