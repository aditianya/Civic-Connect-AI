import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Report() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [location, setLocation] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      title,
      description,
      category,
      location,
    });

    alert("Report submitted successfully!");

    navigate("/reports");
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