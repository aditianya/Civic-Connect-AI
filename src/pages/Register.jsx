import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="login-screen">

      <div className="login-media"></div>

      <form className="login-card" onSubmit={handleRegister}>

        <div className="brand brand--dark">
          <span className="brand__mark">CM</span>
          <span>CivicMind AI</span>
        </div>

        <p className="eyebrow">
          Community Hero
        </p>

        <h1>
          Create your account
        </h1>

        <p className="login-copy">
          Join CivicMind AI to report civic issues,
          track community problems, and connect
          with city authorities.
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
          Create account
        </button>

        <p className="login-hint">
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </p>

      </form>

    </section>
  );
}

export default Register;