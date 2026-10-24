import { useRef, useState } from "react";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import Navbar from "../components/Navbar";
import LocationPicker from "../components/LocationPicker";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Report() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [position, setPosition] = useState(null);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Roads");
    setLocation("");
    setImage(null);
    setPosition(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    if (!auth.currentUser) {
      setMessage({ type: "error", text: "Please sign in before submitting a report." });
      return;
    }
    if (!image) {
      setMessage({ type: "error", text: "Add a photo so we can assess the issue." });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "civic_reports");
      const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/temhkgwl/image/upload", { method: "POST", body: formData });
      const cloudinaryData = await cloudinaryResponse.json();
      if (!cloudinaryResponse.ok) throw new Error(cloudinaryData.error?.message || "Image upload failed.");

      const imageUrl = cloudinaryData.secure_url;
      const aiResponse = await fetch(`${API_URL}/api/analyze-report`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl, description }),
      });
      const aiData = await aiResponse.json();
      if (!aiResponse.ok) throw new Error(aiData.error || "AI analysis failed.");

      // Authenticated community access is used solely for the duplicate comparison.
      const reportsSnapshot = await getDocs(collection(db, "reports"));
      const existingReports = reportsSnapshot.docs.map((report) => ({ id: report.id, ...report.data() }));
      const duplicateResponse = await fetch(`${API_URL}/api/check-duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newReport: { title, description, category: aiData.analysis.category || category, location }, existingReports }),
      });
      const duplicateData = await duplicateResponse.json();
      if (!duplicateResponse.ok) throw new Error(duplicateData.error || "Duplicate detection failed.");
      if (duplicateData.duplicate) {
        setMessage({ type: "duplicate", text: duplicateData.reason || "A similar issue has already been reported nearby.", confidence: Math.round(Number(duplicateData.confidence) || 0) });
        return;
      }

     
const analysis = aiData.analysis;

await addDoc(collection(db, "reports"), {
  title: analysis.suggestedTitle || title,
  description,
  category: analysis.category || category,
  submittedCategory: category,
  location,

  // NEW: Save the selected map coordinates
  latitude: position?.latitude ?? null,
  longitude: position?.longitude ?? null,

  imageUrl,
  userId: auth.currentUser.uid,
  status: "Pending",
  severity: analysis.severity,
  aiCategory: analysis.category,
  aiSeverity: analysis.severity,
  aiSuggestedTitle: analysis.suggestedTitle,
  aiExplanation: analysis.explanation,
  aiPriority: analysis.priority,
  aiDepartment: analysis.department,
  aiRecommendedAction: analysis.recommendedAction,
  aiEstimatedResponseTime: analysis.estimatedResponseTime,
  aiProcessed: true,
  possibleDuplicate: false,
  duplicateConfidence: Number(duplicateData.confidence) || 0,
  duplicateReportId: null,
  duplicateReason: duplicateData.reason || "No similar open report found.",
  createdAt: serverTimestamp(),
});

      resetForm();
      setMessage({ type: "success", text: "Report submitted. We’ll keep you updated as it is reviewed." });
    } catch (error) {
      console.error("Error submitting report:", error);
      setMessage({ type: "error", text: error.message || "Unable to submit the report." });
    } finally { setLoading(false); }
  };

  return <><Navbar /><main className="report-page"><section className="report-header"><p className="eyebrow">Issue intake</p><h1>Report a civic issue</h1><p>Give your local authority a clear, actionable picture of what needs attention. We check for matching reports before creating a new case.</p></section>
    <form className="report-form" onSubmit={handleSubmit}>
      {message && <div className={`form-notice form-notice--${message.type}`} role="status"><strong>{message.type === "duplicate" ? "Possible duplicate found" : message.type === "success" ? "Report received" : "Submission issue"}</strong><span>{message.text}{message.type === "duplicate" && message.confidence ? ` (${message.confidence}% match)` : ""}</span></div>}
      <div className="report-form-grid"><label className="report-form-wide">Issue title<input type="text" placeholder="e.g. Large pothole near the main gate" value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Roads</option><option>Waste Management</option><option>Water Supply</option><option>Electricity</option><option>Public Safety</option><option>Streetlights</option><option>Other</option></select></label>
        <label>Location<input type="text" placeholder="e.g. Main Road, Ward 4" value={location} onChange={(event) => setLocation(event.target.value)} required /></label>
        <div className="report-form-wide"><LocationPicker position={position} onSelect={setPosition} /></div>
        <label className="report-form-wide">What did you notice?<textarea placeholder="Include landmarks, scale, and any immediate safety concern…" value={description} onChange={(event) => setDescription(event.target.value)} required /></label>
        <label className="report-form-wide">Photo evidence<input ref={fileInputRef} type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} required /><small>{image ? `${image.name} selected` : "A clear photo helps us route the issue correctly."}</small></label></div>
      <button className="button button--primary" type="submit" disabled={loading}>{loading ? "Checking report…" : "Submit report"}</button>
    </form></main></>;
}

export default Report;
