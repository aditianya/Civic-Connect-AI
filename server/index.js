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

    if (!newReport.imageUrl) {
      return res.status(400).json({
        error: "New report image is required",
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

    // Prefer reports from the same location.
    const normalize = (value) =>
      (value || "").trim().toLowerCase();

    const newLocation = normalize(newReport.location);

    let candidates = existingReports.filter(
      (report) =>
        normalize(report.location) === newLocation
    );

    // If there are no reports at the exact location,
    // compare a small number of existing reports instead.
    if (candidates.length === 0) {
      candidates = existingReports.slice(0, 5);
    }

    // Limit candidates so the Gemini request does not become too large.
    candidates = candidates.slice(0, 5);

    console.log(
      `Comparing new report with ${candidates.length} existing reports...`
    );

    // Download the new image.
    const newImageResponse = await fetch(newReport.imageUrl);

    if (!newImageResponse.ok) {
      throw new Error("Could not download new report image");
    }

    const newImageBuffer = Buffer.from(
      await newImageResponse.arrayBuffer()
    );

    const newMimeType =
      newImageResponse.headers.get("content-type") ||
      "image/jpeg";

    const contents = [];

    // New report image
    contents.push({
      inlineData: {
        mimeType: newMimeType,
        data: newImageBuffer.toString("base64"),
      },
    });

    // New report information
    contents.push({
      text: `
NEW REPORT

Title: ${newReport.title || ""}
Description: ${newReport.description || ""}
Category: ${newReport.category || ""}
Location: ${newReport.location || ""}
`,
    });

    // Add existing reports and their images.
    for (let i = 0; i < candidates.length; i++) {
      const report = candidates[i];

      contents.push({
        text: `
EXISTING REPORT ${i + 1}

ID: ${report.id}
Title: ${report.title || ""}
Description: ${report.description || ""}
Category: ${report.category || ""}
Location: ${report.location || ""}
`,
      });

      if (report.imageUrl) {
        try {
          const imageResponse = await fetch(report.imageUrl);

          if (imageResponse.ok) {
            const imageBuffer = Buffer.from(
              await imageResponse.arrayBuffer()
            );

            const mimeType =
              imageResponse.headers.get("content-type") ||
              "image/jpeg";

            contents.push({
              inlineData: {
                mimeType,
                data: imageBuffer.toString("base64"),
              },
            });
          }
        } catch (imageError) {
          console.warn(
            `Could not download image for report ${report.id}:`,
            imageError.message
          );
        }
      }
    }

    const prompt = `
You are an AI duplicate-detection system for a civic issue
reporting platform.

Determine whether the NEW REPORT describes the SAME real-world
civic issue as any EXISTING REPORT.

Use ALL available evidence:

1. Visual similarity between the images
2. Issue similarity
3. Description similarity
4. Location similarity
5. Specific landmarks or places

IMPORTANT RULES:

- Same location + same issue is a strong duplicate signal.
- Similar images are a strong duplicate signal.
- Different user wording does NOT mean different issues.
- Different categories do NOT automatically mean different issues.
- For example, "Other" and "Waste Management" can still describe
  the same real-world problem.
- Do NOT mark reports as duplicates merely because they share
  a category.
- Do NOT mark unrelated problems at the same location as duplicates.

The NEW REPORT is followed by EXISTING REPORTS.
The images appear in the same order as their corresponding reports.

Choose the SINGLE strongest matching existing report.

Return duplicate=true only when there is convincing evidence
that the reports describe the same real-world civic issue.

Return only JSON.
`;

    console.log("Sending duplicate comparison to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",

      contents: [
        ...contents,
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