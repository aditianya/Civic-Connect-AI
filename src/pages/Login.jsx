import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <section className="login-screen">

      <div className="login-media"></div>

      <form className="login-card" onSubmit={handleLogin}>

        <div className="brand brand--dark">
          <span className="brand__mark">CM</span>
          <span>CivicMind AI</span>
        </div>

        <p className="eyebrow">
          Community Hero
        </p>

        <h1>
          City operations login
        </h1>

        <p className="login-copy">
          Sign in to review civic issue clusters,
          live map signals, authority actions,
          and citizen rewards.
        </p>

        <label>
          Email

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button
          className="button button--primary login-submit"
          type="submit"
        >
          Enter dashboard
        </button>

        <p className="login-hint">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </form>

    </section>
  );
}

export default Login;