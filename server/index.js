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

    // Download the Cloudinary image
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Could not download report image");
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

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

Then generate:
1. A short, clear issue title.
2. A concise explanation of why you selected the category and severity.

Only return the requested JSON fields.
`;

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
          },
          required: [
            "category",
            "severity",
            "suggestedTitle",
            "explanation",
          ],
        },
      },
    });

    const result = JSON.parse(response.text);

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

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});