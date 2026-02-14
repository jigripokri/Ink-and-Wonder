import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
  throw new Error("GEMINI_API_KEY is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const flashModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const proModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 Delightful Console Logging Utilities
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function logGeminiRequest(action: string, prompt: string, userText: string) {
  console.log('\n');
  console.log(colors.cyan + colors.bright + '╔═══════════════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + colors.bright + '║' + colors.reset + '  ✨ GEMINI API REQUEST' + ' '.repeat(52) + colors.cyan + colors.bright + '║' + colors.reset);
  console.log(colors.cyan + colors.bright + '╚═══════════════════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('');
  
  const modelName = action === 'weave' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  console.log(colors.magenta + colors.bright + '┌─ Action Type' + colors.reset);
  console.log(colors.magenta + '│' + colors.reset + '  ' + colors.yellow + action.toUpperCase() + colors.reset + colors.gray + '  (model: ' + modelName + ')' + colors.reset);
  console.log(colors.magenta + '└─' + colors.reset);
  console.log('');
  
  console.log(colors.blue + colors.bright + '┌─ User Input Text' + colors.reset + colors.gray + ' (first 200 chars)' + colors.reset);
  console.log(colors.blue + '│' + colors.reset + '  ' + userText.substring(0, 200).replace(/\n/g, '\n│  ') + (userText.length > 200 ? '...' : ''));
  console.log(colors.blue + '└─' + colors.reset);
  console.log('');
  
  console.log(colors.green + colors.bright + '┌─ Full System Prompt Sent to Gemini' + colors.reset);
  const promptLines = prompt.split('\n');
  promptLines.forEach((line, i) => {
    if (i === promptLines.length - 1) {
      console.log(colors.green + '│' + colors.reset + '  ' + colors.dim + line + colors.reset);
      console.log(colors.green + '└─' + colors.reset);
    } else {
      console.log(colors.green + '│' + colors.reset + '  ' + colors.dim + line + colors.reset);
    }
  });
  console.log('');
}

function logGeminiResponse(action: string, response: string, durationMs: number) {
  console.log(colors.cyan + colors.bright + '╔═══════════════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + colors.bright + '║' + colors.reset + '  ✅ GEMINI API RESPONSE' + ' '.repeat(51) + colors.cyan + colors.bright + '║' + colors.reset);
  console.log(colors.cyan + colors.bright + '╚═══════════════════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('');
  
  console.log(colors.magenta + colors.bright + '┌─ Action' + colors.reset);
  console.log(colors.magenta + '│' + colors.reset + '  ' + colors.yellow + action.toUpperCase() + colors.reset);
  console.log(colors.magenta + '└─' + colors.reset);
  console.log('');
  
  console.log(colors.blue + colors.bright + '┌─ Duration' + colors.reset);
  console.log(colors.blue + '│' + colors.reset + '  ' + colors.yellow + `${durationMs}ms` + colors.reset);
  console.log(colors.blue + '└─' + colors.reset);
  console.log('');
  
  console.log(colors.green + colors.bright + '┌─ AI Response' + colors.reset + colors.gray + ' (first 300 chars)' + colors.reset);
  const responsePreview = response.substring(0, 300).replace(/\n/g, '\n│  ');
  console.log(colors.green + '│' + colors.reset + '  ' + responsePreview + (response.length > 300 ? '...' : ''));
  console.log(colors.green + '└─' + colors.reset);
  console.log('');
  console.log(colors.cyan + '═'.repeat(79) + colors.reset);
  console.log('\n');
}

export async function enhanceWithAI(
  text: string, 
  _action?: string
): Promise<string> {
  const action = "weave";
  const prompt = `You are the writing assistant for Pratibha, a grandmother in India who writes for her grandchildren to read someday. She writes in her personal journal — sometimes sharing memories, sometimes philosophical reflections, sometimes quick observations about life, sometimes deep essays on topics she cares about.

Your job is to take whatever she has written and make it beautiful while keeping it unmistakably hers.

RULES:
- Fix grammar, spelling, and punctuation naturally as you go
- Organize scattered thoughts into clear, flowing paragraphs with gentle transitions
- Preserve her authentic voice, warmth, personality, and rough edges that give it character
- Keep every personal detail, name, opinion, and perspective exactly as she shared it
- Never change her conclusions or add information, stories, or details she didn't mention
- All Hindi, Hinglish, and Indian English words stay untranslated and unexplained (beta, ji, arre, chai, roti, etc.)
- Respect Indian cultural context — family dynamics, festivals, food, relationships — without westernizing
- Never make it formal, stiff, or essay-like
- No titles, headings, section breaks, or formatting markers

EXPANDING FOR CLARITY:
Some thoughts are complete as-is — a quick insight, a single vivid memory. Leave those tight and polished.
Other thoughts are compressed in a way that a future reader might not fully follow — a reference that needs a sentence of context, an idea that jumps too quickly to land. For these, gently expand just enough so the meaning is clear to someone reading years from now, without padding or over-explaining. A sentence or two of breathing room can make the difference between a thought that resonates and one that confuses.
Never artificially inflate a short piece. Never compress a rich, detailed piece. Let the writing breathe at whatever length feels natural for what she's saying.

TONE:
- Like she's sitting across from you telling you this — over chai, or late at night, or on a quiet morning
- Conversational and honest. If a thought is emotional, let it land. If philosophical, let it sit with the reader.
- It should read like a real person wrote it, not like AI polished it.

CRITICAL: Output ONLY the transformed text. No preamble, no commentary. Just the text itself.

Her writing:
${text}`;

  // Log the request
  logGeminiRequest(action, prompt, text);

  try {
    const startTime = Date.now();
    const selectedModel = action === 'weave' ? proModel : flashModel;
    const result = await selectedModel.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    const duration = Date.now() - startTime;

    logGeminiResponse(action, responseText, duration);

    return responseText;
  } catch (error: any) {
    console.error("AI enhancement error details:", {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      error: error,
    });

    // Provide more specific error message
    if (error?.message?.includes('API key')) {
      throw new Error("Invalid API key. Please check your Gemini API configuration.");
    } else if (error?.message?.includes('quota')) {
      throw new Error("API quota exceeded. Please try again later.");
    } else if (error?.message?.includes('model')) {
      throw new Error("Model not available. Please contact support.");
    }

    throw new Error(`Failed to enhance text with AI: ${error?.message || 'Unknown error'}`);
  }
}

export async function generateMetadata(content: string): Promise<{ excerpt: string; readTime: string }> {
  const wordCount = content.split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  try {
    const prompt = `Create a compelling 1-2 sentence excerpt (15-25 words) for this blog post that captures its essence and invites the reader in. The excerpt should be warm and personal:\n\n${content.substring(0, 500)}`;
    
    const result = await flashModel.generateContent(prompt);
    const excerpt = result.response.text().trim().replace(/^["']|["']$/g, '');

    return { excerpt, readTime };
  } catch (error) {
    console.error("Metadata generation error:", error);
    const firstSentence = content.split(/[.!?]/)[0] + ".";
    return {
      excerpt: firstSentence.substring(0, 150),
      readTime,
    };
  }
}

export async function generateAllMetadata(content: string): Promise<{ 
  title: string; 
  category: string; 
  excerpt: string; 
  readTime: string 
}> {
  const wordCount = content.split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  try {
    const prompt = `You are helping create metadata for a personal blog post written by an older adult sharing memories and life wisdom.

Based on the content below, generate:
1. A warm, inviting title (4-8 words) that captures the heart of the story
2. A simple category (1-2 words) like "Family", "Travel", "Wisdom", "Daily Life", "Memories", etc.
3. A compelling excerpt (15-25 words, 1-2 sentences) that invites the reader in

Format your response EXACTLY like this (no extra text):
TITLE: [your title here]
CATEGORY: [your category here]
EXCERPT: [your excerpt here]

Content:
${content.substring(0, 800)}`;
    
    // Log the metadata generation request
    logGeminiRequest('generate_metadata', prompt, content);
    
    const startTime = Date.now();
    const result = await flashModel.generateContent(prompt);
    const response = result.response.text().trim();
    const duration = Date.now() - startTime;
    
    // Log the metadata generation response
    logGeminiResponse('generate_metadata', response, duration);
    
    // Parse the response
    const titleMatch = response.match(/TITLE:\s*(.+)/i);
    const categoryMatch = response.match(/CATEGORY:\s*(.+)/i);
    const excerptMatch = response.match(/EXCERPT:\s*(.+)/i);
    
    const title = titleMatch 
      ? titleMatch[1].trim().replace(/^["']|["']$/g, '')
      : content.substring(0, 50).split(/[.!?]/)[0] + "...";
    
    const category = categoryMatch 
      ? categoryMatch[1].trim().replace(/^["']|["']$/g, '')
      : "Reflections";
    
    const excerpt = excerptMatch 
      ? excerptMatch[1].trim().replace(/^["']|["']$/g, '')
      : content.split(/[.!?]/)[0].substring(0, 150) + ".";

    return { title, category, excerpt, readTime };
  } catch (error) {
    console.error("Full metadata generation error:", error);
    const firstSentence = content.split(/[.!?]/)[0] + ".";
    return {
      title: firstSentence.substring(0, 50) + (firstSentence.length > 50 ? "..." : ""),
      category: "Reflections",
      excerpt: firstSentence.substring(0, 150),
      readTime,
    };
  }
}
