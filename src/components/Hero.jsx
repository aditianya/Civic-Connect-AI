import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-tag">AI-POWERED CIVIC PLATFORM</p>

        <h1>
          Make Your City
          <span> Better, Together.</span>
        </h1>

        <p className="hero-description">
          Report civic issues, let AI understand them, track their progress,
          and help build a cleaner and smarter community.
        </p>

        <div className="hero-buttons">
          <Link to="/report" className="primary-btn">
            Report an Issue
          </Link>

          <Link to="/dashboard" className="secondary-btn">
            Explore Issues
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;