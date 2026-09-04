import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Request Parser Endpoint: interprets customer WhatsApp/text request into structured quote items
app.post('/api/parse-quote', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'El texto de la solicitud es requerido' });
      return;
    }

    const ai = getAIClient();
    if (!ai) {
      // If no API key is set in environment, return fallback flag so client uses smart local rule parser
      res.json({
        fallback: true,
        message: 'No GEMINI_API_KEY available on server; using local heuristic parser.'
      });
      return;
    }

    const systemInstruction = `Eres un asistente experto de ventas para la empresa de pisos y revestimientos Quicksurfaces.
Tu tarea es interpretar mensajes informales o notas de clientes (de WhatsApp o correo) y extraer los productos, cantidades y servicios solicitados para una cotización formal.

El catálogo de Quicksurfaces incluye:
1. Pisos (category: "piso"):
   - Pulse Select Collection (espesor 5.5mm, 24.26 sqft/caja)
   - Pulse Shield Collection (espesor 5.7mm o 6.5mm, 27.49 sqft/caja)
   - Unidad de medida: sqft (pies cuadrados)
2. Rodapiés / Baseboards (category: "rodapie"):
   - Baseboard BB1x6 (tiras de 16 ft)
   - Unidad de medida: LF (pies lineales)
3. Perfiles y molduras (category: "perfiles"):
   - T-Profile Transition 94", Reducer, etc.
   - Unidad de medida: piezas / units
4. Escaleras / Escalones (category: "escalones"):
   - Stair Nose, paquetes para escalones/peldaños
   - Unidad de medida: escalones / units
5. Instalación / Mano de obra (category: "instalacion"):
   - Servicios de instalación de piso, rodapié o escaleras
6. Otros productos personalizados (category: "otros"):
   - Cualquier material o solicitud no identificada directamente en el catálogo.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura (sin markdown adicional):
{
  "items": [
    {
      "category": "piso" | "rodapie" | "perfiles" | "escalones" | "otros",
      "modelHint": string (ej: "5.5mm", "Pulse Select", "BB1x6", "T-Profile", etc.),
      "colorHint": string (ej: "Moody Gray", "Oak", etc. o ""),
      "quantity": number (número puro positivo, ej: 300, 134, 2),
      "unit": "sqft" | "linear_ft" | "piece" | "unit",
      "description": string (descripción clara del ítem)
    }
  ],
  "installationRequested": boolean (true si pide instalación o mano de obra),
  "clientNotes": string (cualquier detalle relevante del cliente, ej: dirección, tiempo de entrega, color preferido)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Interpreta la siguiente solicitud de cliente para Quicksurfaces y genera el JSON:\n\n"${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const text = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      // Remove backticks if present
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error parsing quote with Gemini:', error);
    res.status(500).json({
      fallback: true,
      error: error.message || 'Error al procesar la solicitud con IA'
    });
  }
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuickQuote server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
