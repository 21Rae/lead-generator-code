import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { executeLeadPipeline, safeJsonParse } from "./server/pipeline.js";
import { sanitizeSupabaseUrl, sanitizeSupabaseKey } from "./src/lib/supabase.js";

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
app.post(["/api/enrich-pipeline", "/enrich-pipeline"], async (req, res) => {
  try {
    const { jobTitle, industry, location, customQuery, maxPages, minLikelihoodScore } = req.body || {};
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

app.post(["/api/generate-profile", "/generate-profile"], async (req, res) => {
  try {
    const { userPrompt } = req.body || {};
    if (!userPrompt || typeof userPrompt !== "string") {
      return res.status(400).json({ success: false, error: "userPrompt string is required." });
    }

    let profile: any = null;
    try {
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

      profile = safeJsonParse(response.text, null);
    } catch (aiErr) {
      console.warn("AI generation failed, using fallback parser:", aiErr);
    }

    // Heuristic fallback if AI key missing or model output not JSON
    if (!profile) {
      const cleanPrompt = userPrompt.replace(/find|search|get|leads|for|in/gi, " ").trim();
      profile = {
        position: cleanPrompt || "Field Engineer",
        industry: "Technology",
        city: "Austin, TX",
      };
    }

    return res.json({ success: true, profile });
  } catch (err: any) {
    console.error("Error in /api/generate-profile:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to extract search parameters.",
    });
  }
});

// -----------------------------------------------------------------------------
// ENDPOINT: Save leads to Supabase enriched_leads table
// -----------------------------------------------------------------------------
app.post(["/api/save-supabase-leads", "/save-supabase-leads"], async (req, res) => {
  try {
    const { leads } = req.body || {};
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, error: "No leads provided to save." });
    }

    const rawSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const rawSupabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    const supabaseUrl = sanitizeSupabaseUrl(rawSupabaseUrl);
    const supabaseKey = sanitizeSupabaseKey(rawSupabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({
        success: false,
        error: "Supabase credentials are not configured or invalid. Please provide your SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SECRET_KEY.",
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rowsToInsert = leads.map((row: any) => ({
      full_name: row.full_name || null,
      sex: row.sex || null,
      linkedin_url: row.linkedin_url || null,
      headline: row.headline || null,
      job_company_name: row.job_company_name || null,
      work_email: row.work_email || null,
      phone_numbers: row.phone_numbers || null,
      company_website: row.company_website || null,
      company_facebook: row.company_facebook || null,
      company_twitter: row.company_twitter || null,
      source_query: row.source_query || null,
      date_enriched: row.date_enriched || new Date().toISOString(),
      enrichment_completeness: row.enrichment_completeness || null,
      likelihood_score: row.likelihood_score || null,
    }));

    const { data, error } = await supabase.from("enriched_leads").insert(rowsToInsert).select();

    if (error) {
      console.error("Supabase insert error:", error);
      let message = error.message;
      if (error.code === "42P01" || message.includes("relation \"enriched_leads\" does not exist") || message.includes("not found")) {
        message = "Table 'enriched_leads' does not exist in your Supabase database yet. Please run the SQL snippet in Supabase SQL Editor to create it.";
      } else if (error.code === "42501" || message.includes("row-level security")) {
        message = "Row Level Security (RLS) is enabled on 'enriched_leads'. Please add an INSERT policy or use the SUPABASE_SERVICE_ROLE_KEY.";
      }
      return res.status(500).json({
        success: false,
        error: `Supabase database error: ${message}`,
      });
    }

    return res.json({ success: true, count: rowsToInsert.length, data });
  } catch (err: any) {
    console.error("Error in /api/save-supabase-leads:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to save leads to Supabase.",
    });
  }
});

export default app;

async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}
