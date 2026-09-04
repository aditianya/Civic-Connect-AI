import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import Navbar from "../components/Navbar";

function Report() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState("Medium");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image");
      return;
    }

    setLoading(true);

    try {
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "civic_reports");

      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/temhkgwl/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error(cloudinaryData.error?.message || "Image upload failed");
      }

      // Save report + image URL to Firestore
      await addDoc(collection(db, "reports"), {
        title,
        description,
        category,
        location,
        imageUrl: cloudinaryData.secure_url,
        userId: auth.currentUser?.uid || null,
        status: "Pending",
        severity: severity,
        aiCategory: category,
        aiProcessed: false,
        createdAt: serverTimestamp(),
      });

      alert("Report submitted successfully!");

      setTitle("");
      setDescription("");
      setCategory("Roads");
      setLocation("");
      setImage(null);

    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report");
    } finally {
      setLoading(false);
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

        <form className="report-form" onSubmit={handleSubmit}>

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

          <label>
            Upload photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </label>
          <label>Severity
            <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <button
            className="button button--primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit report"}
          </button>

        </form>
      </main>
    </>
  );
}

export default Report;