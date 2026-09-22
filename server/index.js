import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,

  httpOptions: {
    retryOptions: {
      attempts: 5,
      initialDelay: 2,
      maxDelay: 30,
      expBase: 2,
      jitter: 1,
      httpStatusCodes: [408, 429, 500, 502, 503, 504],
    },
  },
});
app.get("/", (req, res) => {
  res.send("CivicMind AI server is running");
});
app.post("/api/analyze-report", async (req, res) => {
  try {
    const { imageUrl, description } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: "Image URL is required",
      });
    }

    // Download image from Cloudinary
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Could not download report image");
    }

    const imageBuffer = Buffer.from(
      await imageResponse.arrayBuffer()
    );

    const mimeType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    const base64Image = imageBuffer.toString("base64");

    const prompt = `
You are an AI assistant for a civic issue reporting platform.

Analyze the provided image and the citizen's description.

Citizen description:
${description || "No description provided"}

Classify the civic issue into exactly one of these categories:
- Roads
- Waste Management
- Water Supply
- Electricity
- Public Safety
- Streetlights
- Other

Determine the severity:
- Low
- Medium
- High

Then provide:
1. A short, clear issue title.
2. A concise explanation of why you selected the category and severity.
3. A priority level:
   - Low
   - Medium
   - High
   - Critical
4. The most appropriate civic department to handle the issue.
5. A recommended action that the authority should take.
6. A reasonable estimated response time.

Base your recommendations only on what can reasonably be inferred
from the image and description.

Return only JSON.
`;

    console.log("Sending report to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",

      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
        {
          text: prompt,
        },
      ],

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            category: {
              type: "string",
            },

            severity: {
              type: "string",
            },

            suggestedTitle: {
              type: "string",
            },

            explanation: {
              type: "string",
            },

            priority: {
              type: "string",
            },

            department: {
              type: "string",
            },

            recommendedAction: {
              type: "string",
            },

            estimatedResponseTime: {
              type: "string",
            },
          },

          required: [
            "category",
            "severity",
            "suggestedTitle",
            "explanation",
            "priority",
            "department",
            "recommendedAction",
            "estimatedResponseTime",
          ],
        },
      },
    });

    const result = JSON.parse(response.text);

    console.log("Gemini analysis successful.");

    res.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error("AI analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
app.post("/api/check-duplicate", async (req, res) => {
  try {
    const { newReport, existingReports } = req.body;

    if (!newReport) {
      return res.status(400).json({
        error: "New report is required",
      });
    }

    if (!existingReports || existingReports.length === 0) {
      return res.json({
        success: true,
        duplicate: false,
        confidence: 0,
        duplicateReportId: null,
        reason: "No existing reports to compare.",
      });
    }

    // Only send useful information to Gemini.
    const reportsText = existingReports
      .slice(0, 10)
      .map(
        (report, index) => `
REPORT ${index + 1}
ID: ${report.id}
Title: ${report.title || ""}
Description: ${report.description || ""}
Category: ${report.category || ""}
Location: ${report.location || ""}
AI Category: ${report.aiCategory || ""}
AI Suggested Title: ${report.aiSuggestedTitle || ""}
`
      )
      .join("\n");

    const prompt = `
You are a duplicate-detection system for a civic issue reporting platform.

Compare the NEW REPORT with the EXISTING REPORTS.

A report should be considered a possible duplicate when it appears
to describe the SAME real-world civic problem.

IMPORTANT:

- Same or very similar location is a STRONG signal.
- Same or very similar issue is a STRONG signal.
- Similar descriptions are a STRONG signal.
- Similar titles are useful.
- Different categories do NOT automatically mean different issues.
- Do NOT mark reports duplicate just because they are in the same category.
- Focus on whether they describe the same physical problem.

NEW REPORT:

Title: ${newReport.title || ""}
Description: ${newReport.description || ""}
Category: ${newReport.category || ""}
Location: ${newReport.location || ""}

EXISTING REPORTS:

${reportsText}

Choose the SINGLE strongest matching report.

If the same issue appears to have already been reported,
return duplicate=true.

Otherwise return duplicate=false.

Return only JSON.
`;

    console.log("Checking duplicate reports...");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",

      contents: [
        {
          text: prompt,
        },
      ],

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            duplicate: {
              type: "boolean",
            },

            confidence: {
              type: "number",
            },

            duplicateReportId: {
              type: ["string", "null"],
            },

            reason: {
              type: "string",
            },
          },

          required: [
            "duplicate",
            "confidence",
            "duplicateReportId",
            "reason",
          ],
        },
      },
    });

    const result = JSON.parse(response.text);

    console.log("Duplicate detection result:", result);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Duplicate check error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});