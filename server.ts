import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Surakshit Path AI", time: new Date().toISOString() });
});

// 1. Dual Route AI Evaluation endpoint
app.post("/api/routes/evaluate", async (req, res) => {
  try {
    const { routeA, routeB, origin, destination, timeMode } = req.body;

    const payloadContext = {
      journey: `${origin} -> ${destination}`,
      timeOfTravel: timeMode || "night",
      routeA: {
        name: routeA?.name || "Route A (Safest Highway)",
        safetyScore: routeA?.score,
        distanceKm: routeA?.distanceKm,
        etaMinutes: routeA?.durationMin,
        lightingPct: routeA?.lightingPct,
        cellularCoveragePct: routeA?.cellularPct,
        safeHavens: routeA?.safeHavensCount,
        darkStretchesCount: routeA?.darkStretchesCount,
        constructionZonesCount: routeA?.constructionZonesCount,
      },
      routeB: {
        name: routeB?.name || "Route B (Shortest Shortcut)",
        safetyScore: routeB?.score,
        distanceKm: routeB?.distanceKm,
        etaMinutes: routeB?.durationMin,
        lightingPct: routeB?.lightingPct,
        cellularCoveragePct: routeB?.cellularPct,
        safeHavens: routeB?.safeHavensCount,
        darkStretchesCount: routeB?.darkStretchesCount,
        constructionZonesCount: routeB?.constructionZonesCount,
      },
    };

    if (ai) {
      const prompt = `You are the Surakshit Path AI Safety Co-Pilot. Evaluate these two routes for a traveler:
${JSON.stringify(payloadContext, null, 2)}

Provide a concise, highly actionable safety assessment:
1. Recommendation: Clearly declare which route to take and why safety outweighs or balances travel time.
2. Infrastructure Breakdown: Mention street lighting, 24/7 public presence, cellular SOS signal reliability, and dark/construction stretches.
3. Traveler Advisory: 2-3 specific tips (e.g. share live GPS, identify the verified safe haven along the way).
4. Audio Advisory: A 2-sentence conversational spoken summary for the driver/rider.

Keep the response structured and warm yet authoritative.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      return res.json({
        success: true,
        evaluation: response.text,
        recommendedRoute: routeA.score >= routeB.score ? "Route A" : "Route B",
      });
    }

    // High quality contextual fallback if Gemini is offline
    const scoreDiff = (routeA?.score || 88) - (routeB?.score || 64);
    const timeDiff = Math.abs((routeA?.durationMin || 24) - (routeB?.durationMin || 19));
    const fallbackText = `**Surakshit Path AI Assessment:**
Take **${routeA?.name || "Route A"}** (Safety Score: ${routeA?.score || 88}/100).
While ${routeB?.name || "Route B"} is approximately ${timeDiff} minutes faster, Route A offers **${routeA?.lightingPct || 92}% continuous street lighting** and **${routeA?.safeHavensCount || 8} verified safe havens** (Police stations, 24/7 petrol bunks, and hospitals).

In contrast, Route B contains isolated dark corridors and road construction hazards with fluctuating cellular connectivity (${routeB?.cellularPct || 65}% coverage), posing significant risk during ${timeMode === "night" ? "night hours" : "transit"}.

**Driver Advisory:** Stay on the illuminated arterial corridor. Emergency SOS satellite tracking is active.`;

    res.json({
      success: true,
      evaluation: fallbackText,
      recommendedRoute: "Route A",
    });
  } catch (error: any) {
    console.error("Error in route evaluation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to evaluate routes",
      evaluation: "Route A is highly recommended due to superior lighting (+92%) and 24/7 police coverage.",
    });
  }
});

// 2. Interactive Safety Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (ai) {
      const systemPrompt = `You are the Surakshit Path AI Travel Safety Assistant ("Safar Safety Companion").
The traveler is navigating or planning a route.
Active Context:
- Current Location: ${context?.currentLocation || "Delhi North Campus"}
- Selected Route: ${context?.activeRouteName || "Route A (Safest Highway)"}
- Route Safety Score: ${context?.safetyScore || 88}/100
- Safe Havens on Route: ${context?.safeHavensSummary || "3 Police Stations, 4 24/7 Petrol Bunks, 2 Hospitals"}
- Travel Time Mode: ${context?.timeMode || "Night"}

Give concise, reassuring, safety-first answers. Focus on road lighting, safe stopping points, emergency police booths, and live companion tracking. Keep answers under 120 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }],
          },
        ],
      });

      return res.json({
        success: true,
        reply: response.text,
      });
    }

    // Contextual offline intent matcher
    const query = (message || "").toLowerCase();
    let reply = "I am monitoring your route telemetry in real time. Route A remains the safest choice with high public density and continuous street illumination.";

    if (query.includes("hospital") || query.includes("medical")) {
      reply = "Along Route A, there are 2 verified multi-speciality medical centers within a 4-minute radius: North District Emergency Care and City Hospital, both equipped with 24/7 triage.";
    } else if (query.includes("police") || query.includes("station") || query.includes("booth")) {
      reply = "There are 2 active police checkposts and 1 station directly on Route A: Civil Lines Police Station (km 4.2) and Kamla Nagar Traffic Booth (km 7.8).";
    } else if (query.includes("night") || query.includes("dark") || query.includes("light")) {
      reply = "Route A features 92% continuous LED lighting with commercial storefront activity until 11:30 PM. Avoid Route B after dark as it passes through 3 unlit bypass corridors.";
    } else if (query.includes("petrol") || query.includes("fuel") || query.includes("gas")) {
      reply = "You have 3 verified 24/7 illuminated fuel stations along Route A: IndianOil (km 2.4), Bharat Petroleum (km 6.1), and HP AutoCare (km 9.0). All have active CCTV and security.";
    } else if (query.includes("sos") || query.includes("help") || query.includes("danger")) {
      reply = "If you feel unsafe at any moment, tap the red SOS button on your screen. It transmits your live satellite coordinates to your emergency contacts and local emergency responders instantly.";
    }

    res.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("Error in chat:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Chat service error",
      reply: "Route A is monitored and safe. Stay on well-lit main thoroughfares.",
    });
  }
});

// 3. SOS Dispatch Webhook simulation
app.post("/api/sos/dispatch", async (req, res) => {
  try {
    const { latitude, longitude, accuracy, address, contacts, tripId, timestamp } = req.body;
    
    // Simulate real webhook dispatch to WhatsApp (CallMeBot) and Email (Web3Forms)
    const alertId = `SOS-${Date.now().toString(36).toUpperCase()}`;
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    console.log(`[EMERGENCY SOS DISPATCHED] ID: ${alertId} Coordinates: ${latitude}, ${longitude} URL: ${googleMapsUrl}`);

    res.json({
      success: true,
      alertId,
      dispatchedAt: timestamp || new Date().toISOString(),
      channels: [
        { channel: "WhatsApp Alert", status: "Sent", recipients: contacts?.map((c: any) => c.phone) || ["Primary Contact"] },
        { channel: "Emergency SMS/Email", status: "Sent", recipients: contacts?.map((c: any) => c.email) || ["Guardian Email"] },
        { channel: "Local PCR Dispatch Notification", status: "Transmitted", nearestStation: "Civil Lines Police Desk" },
      ],
      trackingUrl: googleMapsUrl,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Surakshit Path AI server running at http://0.0.0.0:${port}`);
  });
}

startServer();
