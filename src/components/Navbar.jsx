import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        CivicConnect<span>AI</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/report">Report Issue</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin">Admin</Link>
      </div>

      <Link to="/login" className="login-btn">
        Login
      </Link>
    </nav>
  );
}

export default Navbar;