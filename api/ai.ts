import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
  throw new Error("GEMINI_API_KEY is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use gemini-2.5-flash - latest stable model with best price-performance
// 2.5 Flash: State-of-the-art creative writing, superior reasoning, 1M token context
// Optimized for production use with excellent quality and speed
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
  
  console.log(colors.magenta + colors.bright + '┌─ Action Type' + colors.reset);
  console.log(colors.magenta + '│' + colors.reset + '  ' + colors.yellow + action.toUpperCase() + colors.reset);
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
  action: string,
  fullContent?: string,
  selectedText?: string,
  selectionStart?: number,
  selectionEnd?: number
): Promise<string> {
  const hasSelection = fullContent && selectedText && selectionStart !== undefined && selectionEnd !== undefined;
  
  const prompts: Record<string, string> = {
    shorten: hasSelection 
      ? `You are helping an older adult condense their writing. They have selected a specific part of their text to make shorter.

Here is their full text with [START] and [END] markers showing what to shorten:

${fullContent!.substring(0, selectionStart!)}[START]${selectedText}[END]${fullContent!.substring(selectionEnd!)}

Your task: Make the text between [START] and [END] shorter and more concise while:
- Keeping all important meaning and their personal voice
- Ensuring it flows naturally with what comes before and after
- Maintaining warmth and personal anecdotes

CRITICAL INSTRUCTION: Return ONLY your shortened version of "${selectedText}" - nothing else. Do NOT include [START]/[END] markers. Do NOT include the surrounding text. Do NOT add any preamble. Just return the condensed text that will replace "${selectedText}".`
      : `You are helping an older adult condense their writing. Make the following text shorter and more concise while keeping all the important meaning and their personal voice intact. Don't lose the warmth or personal anecdotes.

IMPORTANT: Output ONLY the shortened text. Do not include any preamble, explanations, or commentary. Just output the condensed text directly.

Text to shorten:
${text}`,
    
    elaborate: hasSelection
      ? `You are helping an older adult add more depth to their writing. They have selected a specific part of their text to elaborate on.

Here is their full text with [START] and [END] markers showing what to elaborate:

${fullContent!.substring(0, selectionStart!)}[START]${selectedText}[END]${fullContent!.substring(selectionEnd!)}

Your task: Elaborate ONLY on the text between [START] and [END]. Add more details, examples, or reflections that:
- Feel natural to their voice and style
- Flow smoothly with what comes before and after
- Are warm and personal
- Make sense given the full context

CRITICAL INSTRUCTION: Return ONLY your elaborated version of "${selectedText}" - nothing else. Do NOT include [START]/[END] markers. Do NOT include the surrounding text. Do NOT add any preamble like "Here's the elaboration:" or "Oh,". Just return the elaborated text that will replace "${selectedText}".`
      : `You are helping an older adult add more depth to their writing. Expand on the following text by adding more details, examples, or reflections that feel natural to their voice and style. Keep it warm and personal.

IMPORTANT: Output ONLY the elaborated text. Do not include any preamble, explanations, or commentary. Just output the expanded text directly.

Text to elaborate:
${text}`,
    
    grammar: hasSelection
      ? `You are helping an older adult fix grammar and mechanics in their writing. They have selected a specific part of their text to correct.

Here is their full text with [START] and [END] markers showing what to fix:

${fullContent!.substring(0, selectionStart!)}[START]${selectedText}[END]${fullContent!.substring(selectionEnd!)}

Your task: Fix any grammatical errors, spelling mistakes, and punctuation issues in the text between [START] and [END] while:
- Keeping their voice and style exactly the same
- Ensuring it flows naturally with what comes before and after
- Only fixing technical errors, not changing meaning or tone

CRITICAL INSTRUCTION: Return ONLY your corrected version of "${selectedText}" - nothing else. Do NOT include [START]/[END] markers. Do NOT include the surrounding text. Do NOT add any preamble. Just return the grammatically correct text that will replace "${selectedText}".`
      : `You are helping an older adult fix grammar and mechanics in their writing. Correct any grammatical errors, spelling mistakes, and punctuation issues in the following text. Keep their voice and style exactly the same, just fix the technical errors.

IMPORTANT: Output ONLY the corrected text. Do not include any preamble, explanations, or commentary about what was fixed. Just output the grammatically correct text directly.

Text to correct:
${text}`,
    
    weave: `You are a compassionate writing assistant helping an older adult transform their stream-of-consciousness thoughts into a beautiful, coherent blog post for their family legacy journal.

The writer is sharing personal memories, wisdom, and reflections meant to be passed down to future generations. Your task is to:

1. Organize their thoughts into clear, flowing paragraphs
2. Preserve their authentic voice, personality, and warmth
3. Keep all personal stories and details exactly as shared
4. Add gentle transitions where needed
5. Fix grammar and clarity issues naturally
6. Maintain their conversational, heartfelt tone
7. Create a narrative that feels like them telling a story

Do NOT:
- Make it overly formal or academic
- Remove personal details or emotion
- Change their perspective or opinions
- Add information they didn't mention
- Make it sound like someone else wrote it

CRITICAL: Output ONLY the transformed blog post text. Do not include any preamble like "Here's the transformed version:" or explanations. Do not add titles, headings, or meta-commentary. Just output the blog post content itself.

Their thoughts:
${text}`,
  };

  const prompt = prompts[action] || prompts.grammar;

  // Log the request
  logGeminiRequest(action, prompt, text);

  try {
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    const duration = Date.now() - startTime;

    // Log the response
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
    
    const result = await model.generateContent(prompt);
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
    const result = await model.generateContent(prompt);
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
