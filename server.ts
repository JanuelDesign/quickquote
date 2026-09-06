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

// Proxy endpoint to fetch Google Sheets without CORS restrictions and with multiple fallbacks
app.post('/api/sheets-sync', async (req, res) => {
  try {
    const { url, sheetName } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({ success: false, error: 'URL de Google Sheets requerida' });
      return;
    }

    const cleanUrl = url.trim();

    // Extract doc ID and any gid (sheet tab) if present
    const idMatch = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = cleanUrl.match(/[#?&]gid=([0-9]+)/);
    const docId = idMatch ? idMatch[1] : null;
    const gid = gidMatch ? gidMatch[1] : null;

    const candidateUrls: string[] = [];

    // 1. If already an export or published link
    if (cleanUrl.includes('output=csv') || cleanUrl.includes('/pub?') || cleanUrl.includes('format=csv')) {
      candidateUrls.push(cleanUrl);
    }

    if (docId) {
      // 2. Google Visualization API (CSV format)
      // If user passed sheetName, try that; otherwise if gid exists, pass gid; otherwise try default sheet
      if (sheetName && sheetName.trim()) {
        candidateUrls.push(`https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName.trim())}`);
      }
      if (gid) {
        candidateUrls.push(`https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv&gid=${gid}`);
        candidateUrls.push(`https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`);
      }
      // 3. Fallback: GViz without sheet parameter (defaults to the first tab)
      candidateUrls.push(`https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv`);
      // 4. Fallback: Export CSV (first tab)
      candidateUrls.push(`https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`);
    } else {
      candidateUrls.push(cleanUrl);
    }

    let lastError = '';
    let fetchedText = '';

    for (const fetchUrl of candidateUrls) {
      try {
        const response = await fetch(fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/csv,text/plain,*/*'
          },
          redirect: 'follow'
        });

        if (!response.ok) {
          lastError = `HTTP ${response.status} ${response.statusText}`;
          continue;
        }

        const text = await response.text();

        // Check if Google redirected to sign-in HTML
        if (text.includes('<!DOCTYPE') && (text.includes('accounts.google.com') || text.includes('ServiceLogin') || text.includes('Sign in') || text.includes('Inicia sesión'))) {
          lastError = 'El documento de Google Sheets es privado y requiere inicio de sesión en Google.';
          continue;
        }

        // Check if Google returned an authorization/permission error
        if (text.includes('google.visualization.Query.setResponse') && text.includes('error')) {
          if (text.includes('ACCESS_DENIED') || text.includes('denied') || text.includes('unauthorized')) {
            lastError = 'Acceso denegado por Google. Cambia la opción de compartir a "Cualquier persona con el enlace puede ver".';
            continue;
          }
        }

        // Check if content looks like CSV/TSV table (has commas or tabs or line breaks)
        if (text && text.length > 15 && (text.includes(',') || text.includes('\t') || text.includes('\n'))) {
          fetchedText = text;
          break;
        }
      } catch (err: any) {
        lastError = err.message || 'Error de conexión';
      }
    }

    if (!fetchedText) {
      res.status(400).json({
        success: false,
        error: lastError || 'No se pudo leer la hoja de cálculo.',
        isPrivate: lastError.includes('privado') || lastError.includes('denegado') || lastError.includes('sesión'),
        hint: 'En tu Google Sheet: 1. Haz clic en "Compartir" (arriba a la derecha) > 2. En "Acceso general" cambia de "Restringido" a "Cualquier persona con el enlace" (Rol: Lector) > 3. Copia el enlace. O en "Archivo > Compartir > Publicar en la Web".'
      });
      return;
    }

    res.json({
      success: true,
      data: fetchedText,
      docId,
      gid
    });
  } catch (error: any) {
    console.error('Error in /api/sheets-sync:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor al sincronizar'
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
