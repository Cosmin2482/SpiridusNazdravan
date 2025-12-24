
import { GoogleGenAI, Type } from "@google/genai";
import { MagicLetter } from "../types";

// Array cu multiple API keys
const getApiKeys = (): string[] => {
  // process.env is defined in vite.config.ts via define, so it's available at build time
  // @ts-ignore - process.env is defined by Vite's define
  const keys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  
  // Suport pentru multiple keys separate prin virgulă
  const parsedKeys = keys.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (parsedKeys.length === 0) {
    console.error('⚠️ No API keys found! Make sure GEMINI_API_KEYS is set in Vercel environment variables.');
  }
  
  return parsedKeys;
};

const apiKeys = getApiKeys();
let currentKeyIndex = 0;

// Tracking pentru keys blocate (quota exceeded, rate limit, etc.)
interface BlockedKey {
  key: string;
  blockedUntil: number; // timestamp
  reason: string;
}

const blockedKeys = new Map<string, BlockedKey>();

// Durata de blocare (30 minute pentru quota, 1 minut pentru rate limit)
const BLOCK_DURATION_QUOTA = 30 * 60 * 1000; // 30 minute
const BLOCK_DURATION_RATE_LIMIT = 60 * 1000; // 1 minut

// Funcție pentru a detecta tipul de eroare
const isQuotaError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || error?.status || '';
  
  return (
    errorMessage.includes('quota') ||
    errorMessage.includes('quota exceeded') ||
    errorMessage.includes('resource exhausted') ||
    errorCode === 429 ||
    errorCode === 403 ||
    errorMessage.includes('billing') ||
    errorMessage.includes('permission denied')
  );
};

const isRateLimitError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || error?.status || '';
  
  return (
    (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) &&
    !isQuotaError(error)
  ) || errorCode === 429;
};

// Funcție pentru a marca un key ca blocat
const blockKey = (key: string, reason: string, duration: number) => {
  blockedKeys.set(key, {
    key,
    blockedUntil: Date.now() + duration,
    reason
  });
  console.warn(`🔒 API key blocked: ${reason}. Will retry after ${Math.round(duration / 1000)}s`);
};

// Funcție pentru a verifica dacă un key este disponibil
const isKeyAvailable = (key: string): boolean => {
  const blocked = blockedKeys.get(key);
  if (!blocked) return true;
  
  if (Date.now() >= blocked.blockedUntil) {
    blockedKeys.delete(key);
    console.log(`✅ API key unblocked and available again`);
    return true;
  }
  
  return false;
};

// Funcție pentru a obține următorul API key disponibil (rotație circulară)
const getNextAvailableKey = (): string | null => {
  if (apiKeys.length === 0) return null;
  
  // Încearcă să găsească un key disponibil începând de la indexul curent
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    
    if (isKeyAvailable(key)) {
      return key;
    }
  }
  
  // Dacă toate sunt blocate, returnează primul disponibil (sau primul)
  // pentru a încerca oricum (poate s-a deblocat între timp)
  return apiKeys[0] || null;
};

// Funcție helper pentru a crea o instanță AI cu un API key specific
const createAIInstance = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

// Funcție îmbunătățită pentru a încerca cu toate API keys-urile
// Folosește rotație circulară și fallback inteligent
const tryWithAllKeys = async <T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  const errors: Array<{ key: string; error: Error }> = [];
  const triedKeys = new Set<string>();
  
  // Încearcă cu toate keys-urile disponibile (rotație circulară)
  for (let attempt = 0; attempt < apiKeys.length * 2; attempt++) {
    const key = getNextAvailableKey();
    
    if (!key) {
      // Toate keys-urile sunt blocate, așteaptă puțin și încearcă din nou
      const minBlockedTime = Math.min(
        ...Array.from(blockedKeys.values()).map(b => b.blockedUntil)
      );
      const waitTime = Math.max(0, minBlockedTime - Date.now());
      
      if (waitTime > 0 && waitTime < 60000) { // Max 1 minut de așteptare
        console.log(`⏳ All keys blocked, waiting ${Math.round(waitTime / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 5000))); // Max 5s wait
        continue;
      }
      break;
    }
    
    // Evită să încerce același key de două ori în același request
    if (triedKeys.has(key) && triedKeys.size >= apiKeys.length) {
      break;
    }
    triedKeys.add(key);
    
    try {
      const ai = createAIInstance(key);
      const result = await operation(ai);
      
      // Dacă a reușit, resetează indexul pentru următorul request (distribuție uniformă)
      return result;
    } catch (error: any) {
      const errorObj = error as Error;
      errors.push({ key, error: errorObj });
      
      // Detectează tipul de eroare și blochează key-ul corespunzător
      if (isQuotaError(error)) {
        blockKey(key, `Quota exceeded for key`, BLOCK_DURATION_QUOTA);
        console.warn(`⚠️ API key ${apiKeys.indexOf(key) + 1} quota exceeded, blocked for 30min`);
      } else if (isRateLimitError(error)) {
        blockKey(key, `Rate limit hit for key`, BLOCK_DURATION_RATE_LIMIT);
        console.warn(`⚠️ API key ${apiKeys.indexOf(key) + 1} rate limited, blocked for 1min`);
      } else {
        // Pentru alte erori, nu blocăm key-ul (poate fi temporar)
        console.warn(`⚠️ API key ${apiKeys.indexOf(key) + 1} error: ${errorObj.message}`);
      }
      
      // Continuă cu următorul key
      continue;
    }
  }
  
  // Dacă toate au eșuat, aruncă ultima eroare
  const lastError = errors[errors.length - 1];
  throw lastError?.error || new Error('No API keys available');
};

export const generateMagicLetter = async (userName: string, base64Image?: string): Promise<MagicLetter> => {
  try {
    const prompt = `Ești un spiriduș Gen Z de elită de la Polul Nord, expert în vibe-uri și storytelling. 
      Numele utilizatorului este '${userName}'. 
      ${base64Image ? "Analizează poza atașată pentru a-i face un roast prietenos feței/expresiei." : ""}
      Scrie o scrisoare magică în română (aprox 150-200 cuvinte) care să fie:
      1. Funny: Folosește slang modern (rizz, main character energy, delulu is the solulu, on fleek).
      2. Creative: Explică semnificația numelui său într-un mod complet inventat și magic.
      3. Heartfelt: O urare de Crăciun sinceră dar cool.
      4. Story: O poveste scurtă despre cum Moșul era să-i piardă cadoul dar l-ai salvat tu pentru că ești cel mai bun spiriduș.
      Returnează doar JSON conform schemei.`;

    const parts: any[] = [{ text: prompt }];
    if (base64Image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image.split(',')[1]
        }
      });
    }

    const response = await tryWithAllKeys(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              meaning_of_name: { type: Type.STRING },
              funny_joke: { type: Type.STRING },
              heartfelt_wish: { type: Type.STRING },
              personalized_story: { type: Type.STRING },
            },
            required: ["meaning_of_name", "funny_joke", "heartfelt_wish", "personalized_story"]
          }
        }
      });
    });

    return JSON.parse(response.text || '{}') as MagicLetter;
  } catch (error) {
    return {
      meaning_of_name: `${userName} - adică 'Vibe-ul care nu doarme'.`,
      funny_joke: `Poza asta e peak Gen Z, no cap. Arăți de parcă ai aflat că Moșul nu are 5G în sanie.`,
      heartfelt_wish: `Să ai un Crăciun absolut legendar, plin de sclipici și zero stres!`,
      personalized_story: `Băi, era să-ți încurce Moșu' coletul cu al unui pinguin din Antarctica, dar am intervenit eu cu un drift pe sanie și l-am marcat 'VIP - Do Not Open'. Ești oficial cel mai tare de pe zonă anul ăsta!`
    };
  }
};

export const generateElfSticker = async (userName: string, base64Image: string): Promise<string | null> => {
  try {
    console.log('🎨 Starting elf sticker generation for:', userName);
    const response = await tryWithAllKeys(async (ai) => {
      // Try multiple models in order of preference (according to official docs)
      const models = [
        { name: 'gemini-2.5-flash-image', config: { aspectRatio: "9:16" } },
        { name: 'gemini-3-pro-image-preview', config: { aspectRatio: "9:16", imageSize: "1K" } }
      ];
      
      for (const model of models) {
        try {
          console.log(`🔄 Trying model: ${model.name}`);
          const result = await ai.models.generateContent({
            model: model.name,
            contents: {
              parts: [
                {
                  inlineData: {
                    data: base64Image.split(',')[1],
                    mimeType: 'image/jpeg',
                  },
                },
                {
                  text: `Transform the person in this photo into a cute 3D Pixar-style Christmas Elf character named ${userName}. Keep their facial features recognizable. They should be wearing a cool red/green outfit and a pointy hat with a bell. The background should be transparent or soft white blur. Portrait format.`,
                },
              ],
            },
            config: {
              imageConfig: model.config,
              responseModalities: ['IMAGE'] // Only return image, no text
            }
          });
          console.log(`✅ Success with model: ${model.name}`);
          return result;
        } catch (modelError: any) {
          console.warn(`⚠️ Model ${model.name} failed:`, modelError?.message);
          if (model === models[models.length - 1]) {
            // Last model, throw the error
            throw modelError;
          }
          // Try next model
          continue;
        }
      }
      throw new Error('All image generation models failed');
    });

    console.log('✅ Elf sticker response received');
    
    // Check for image data in response
    const candidates = response.candidates || [];
    if (candidates.length === 0) {
      console.warn('⚠️ No candidates in response');
      return null;
    }

    for (const part of candidates[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log('✅ Found inline image data');
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    console.warn('⚠️ No inline data found in response parts');
    return null;
  } catch (error: any) {
    console.error("❌ Elf-ify sticker failed:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      stack: error?.stack
    });
    return null;
  }
};

export const generateChristmasBackground = async (userName: string): Promise<string | null> => {
  try {
    console.log('🎨 Starting background generation for:', userName);
    const response = await tryWithAllKeys(async (ai) => {
      // Try multiple models in order of preference (according to official docs)
      const models = [
        { name: 'gemini-2.5-flash-image', config: { aspectRatio: "9:16" } },
        { name: 'gemini-3-pro-image-preview', config: { aspectRatio: "9:16", imageSize: "1K" } }
      ];
      
      for (const model of models) {
        try {
          console.log(`🔄 Trying model: ${model.name}`);
          const result = await ai.models.generateContent({
            model: model.name,
            contents: {
              parts: [
                {
                  text: `A cinematic 9:16 background of a magical Christmas workshop. Bokeh golden lights, snow falling outside, huge decorated tree, cozy atmosphere, Pixar/Disney style animation background for ${userName}.`,
                },
              ],
            },
            config: {
              imageConfig: model.config,
              responseModalities: ['IMAGE'] // Only return image, no text
            }
          });
          console.log(`✅ Success with model: ${model.name}`);
          return result;
        } catch (modelError: any) {
          console.warn(`⚠️ Model ${model.name} failed:`, modelError?.message);
          if (model === models[models.length - 1]) {
            // Last model, throw the error
            throw modelError;
          }
          // Try next model
          continue;
        }
      }
      throw new Error('All image generation models failed');
    });

    console.log('✅ Background response received');
    
    // Check for image data in response
    const candidates = response.candidates || [];
    if (candidates.length === 0) {
      console.warn('⚠️ No candidates in response');
      return null;
    }

    for (const part of candidates[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log('✅ Found inline image data');
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    console.warn('⚠️ No inline data found in response parts');
    return null;
  } catch (error: any) {
    console.error("❌ Background generation failed:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      stack: error?.stack
    });
    return null;
  }
};
