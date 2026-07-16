import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from "googleapis";
import cookieParser from "cookie-parser";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Route: Recommendations from Gemini
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { prompt } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Act as a music recommendation engine. Given this prompt or history: "${prompt || 'something popular right now'}", suggest 5 songs.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                source: { type: Type.STRING, description: "Must be 'youtube'" }
              },
              required: ["title", "artist", "source"]
            }
          }
        }
      });
      
      let text = response.text || "[]";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      let recommendations = [];
      try {
        recommendations = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse Gemini response as JSON", text);
      }
      
      res.json(recommendations);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy search to mock searching YouTube for now, or using real APIs if keys exist
  app.get("/api/search", async (req, res) => {
    const q = req.query.q as string;
    if (!q) return res.json([]);
    
    // In a full implementation with API keys:
    // const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
    
    // Mocking real response formatting
    const mockResults = [
      { id: 'dQw4w9WgXcQ', title: `${q} - Official Video`, artist: 'Various Artists', source: 'youtube', youtubeId: 'dQw4w9WgXcQ', albumArt: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=150&auto=format&fit=crop' },
    ];
    
    res.json(mockResults);
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
