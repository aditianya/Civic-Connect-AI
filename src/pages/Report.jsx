import { useState } from "react";
import Navbar from "../components/Navbar";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

function Report() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "reports"), {
        title,
        description,
        category,
        location,
        status: "Pending",
        userId: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });

      alert("Report submitted successfully!");

      setTitle("");
      setDescription("");
      setCategory("Roads");
      setLocation("");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report");
    }
  };

  return (
    <>
      <Navbar />

      <main className="report-page">

        <section className="report-header">
          <p className="eyebrow">Issue Intake</p>

          <h1>Report a civic issue</h1>

          <p>
            Tell us about a problem in your community.
            Your report will help authorities identify
            and resolve civic issues faster.
          </p>
        </section>

        <form
          className="report-form"
          onSubmit={handleSubmit}
        >

          <label>
            Issue title

            <input
              type="text"
              placeholder="Example: Large pothole near main gate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Description

            <textarea
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label>
            Category

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Roads</option>
              <option>Waste Management</option>
              <option>Water Supply</option>
              <option>Electricity</option>
              <option>Public Safety</option>
              <option>Streetlights</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Location

            <input
              type="text"
              placeholder="Example: Main Road"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </label>

          <button
            className="button button--primary"
            type="submit"
          >
            Submit report
          </button>

        </form>

      </main>
    </>
  );
}

export default Report;