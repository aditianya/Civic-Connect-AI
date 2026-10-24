import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";

function AdminRoute({ children }) {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setState({ loading: false, allowed: false });
      return;
    }
    try {
      const profile = await getDoc(doc(db, "users", user.uid));
      setState({ loading: false, allowed: profile.data()?.role === "admin" });
    } catch (error) {
      console.error("Unable to verify admin role:", error);
      setState({ loading: false, allowed: false });
    }
  }), []);

  if (state.loading) return <p className="route-loading">Checking access…</p>;
  return state.allowed ? children : <Navigate to="/dashboard" replace />;
}

export default AdminRoute;
