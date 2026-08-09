import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { executeLeadPipeline, leadsToCSV } from "./server/pipeline";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// -----------------------------------------------------------------------------
// ENDPOINT: Run End-to-End Lead Enrichment Pipeline
// -----------------------------------------------------------------------------
app.post("/api/enrich-pipeline", async (req, res) => {
  try {
    const { jobTitle, industry, location, customQuery, maxPages, minLikelihoodScore } = req.body;
    let aiClient: GoogleGenAI | undefined;
    try {
      aiClient = getGenAI();
    } catch {
      // AI client optional for pipeline
    }

    const pipelineResult = await executeLeadPipeline(
      {
        jobTitle: jobTitle || "Field Engineer",
        industry: industry || "Construction",
        location: location || "Austin, TX",
        customQuery,
        maxPages,
        minLikelihoodScore,
      },
      aiClient
    );

    return res.json({
      success: true,
      logs: pipelineResult.logs,
      leads: pipelineResult.leads,
      csvContent: pipelineResult.csvContent,
      outputDestination: process.env.OUTPUT_DESTINATION || "csv",
      outputDestinationId: process.env.OUTPUT_DESTINATION_ID || null,
    });
  } catch (err: any) {
    console.error("Error in /api/enrich-pipeline:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to execute lead enrichment pipeline.",
    });
  }
});

const profileSchema = {
  type: Type.OBJECT,
  properties: {
    position: { type: Type.STRING, description: "Job title or position, e.g., Field Engineer" },
    industry: { type: Type.STRING, description: "Industry sector, e.g., Construction" },
    city: { type: Type.STRING, description: "City or location, e.g., Austin, TX" },
  },
  required: [
    "position",
    "industry",
    "city",
  ],
};

app.post("/api/generate-profile", async (req, res) => {
  try {
    const { userPrompt } = req.body;
    if (!userPrompt || typeof userPrompt !== "string") {
      return res.status(400).json({ error: "userPrompt string is required." });
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction:
          "You extract search parameters for lead enrichment: position (job title), industry, and city (location). Only populate these 3 defined fields.",
        responseMimeType: "application/json",
        responseSchema: profileSchema,
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No text output returned from AI model.");
    }

    const profile = JSON.parse(outputText);
    return res.json({ success: true, profile });
  } catch (err: any) {
    console.error("Error in /api/generate-profile:", err);
    return res.status(500).json({
      error: err?.message || "Failed to extract search parameters.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
