import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

const _fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : null;

/**
 * Helper to call Ollama generate API
 */
async function callOllama(prompt, format = null) {
  try {
    const payload = {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    };
    if (format) payload.format = format;

    const response = await _fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // 5 minute timeout for Ollama (handles slow CPU-only machines)
      signal: AbortSignal.timeout(300000)
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('[Ollama Error]', error.message);
    throw new Error('AI Provider is currently unavailable.');
  }
}

/**
 * Checks if Ollama is running and accessible
 */
export async function checkOllamaHealth() {
  try {
    const response = await _fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Parse natural language expense text into structured JSON
 */
export async function parseExpenseText(text, categories, currentDate) {
  const categoryNames = categories.filter(c => c.type === 'EXPENSE').map(c => c.name);

  // We ask the LLM to just do simple extraction.
  // Few-shot examples drastically improve performance and accuracy on small 1B models.
  const prompt = `You are a strict data extraction bot. Extract the amount, category, merchant, date, and payment method from the input text.
Current date: ${currentDate.toISOString().split('T')[0]}
Allowed categories: ${categoryNames.join(', ')}

Rules:
1. Output ONLY valid JSON.
2. amount MUST be a pure number.
3. category MUST exactly match one of the allowed categories, or be null.
4. paymentMethod MUST be one of: CASH, UPI, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, WALLET, OTHER. Default to UPI.
5. transactionDate MUST be YYYY-MM-DD.

Examples:
Input: "Spent 500 on Swiggy yesterday via card"
Output: {"amount": 500, "category": "Food", "merchant": "Swiggy", "paymentMethod": "CREDIT_CARD", "transactionDate": "2024-03-14", "notes": null}

Input: "150 for uber"
Output: {"amount": 150, "category": "Transport", "merchant": "Uber", "paymentMethod": "UPI", "transactionDate": "${currentDate.toISOString().split('T')[0]}", "notes": null}

Input: "${text}"
Output:`;

  // Provide a smaller timeout since few-shot is faster, but keep it high enough for slow CPUs
  const responseText = await callOllama(prompt, 'json');
  
  try {
    const parsed = JSON.parse(responseText);
    
    // 1. Robust Category Matching
    let finalCategoryId = categories.find(c => c.name === 'Other')?.id;
    if (parsed.category) {
      const matched = categories.find(c => c.name.toLowerCase() === parsed.category.toLowerCase());
      if (matched) finalCategoryId = matched.id;
    }
    // Category Fallback: Check if user text explicitly mentions a category
    if (!parsed.category || finalCategoryId === categories.find(c => c.name === 'Other')?.id) {
      const textLower = text.toLowerCase();
      const directMatch = categories.find(c => textLower.includes(c.name.toLowerCase()));
      if (directMatch) finalCategoryId = directMatch.id;
    }

    // 2. Robust Amount Extraction
    const rawAmount = String(parsed.amount || '').replace(/[^0-9.]/g, '');
    let amountVal = rawAmount ? Math.abs(Number(rawAmount)) : 0;
    
    // Amount Fallback: If LLM failed, find the first number in the user's text
    if (amountVal === 0) {
      const numberMatches = text.match(/\b\d+(?:\.\d+)?\b/g);
      if (numberMatches && numberMatches.length > 0) {
        amountVal = Math.abs(Number(numberMatches[0]));
      }
    }

    // 3. Robust Date Extraction
    let txDate = parsed.transactionDate;
    const textLower = text.toLowerCase();
    
    // Date Fallback: If LLM failed to give a proper date or we can just read the text
    if (textLower.includes('yesterday')) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      txDate = d.toISOString().split('T')[0];
    } else if (textLower.includes('day before yesterday')) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 2);
      txDate = d.toISOString().split('T')[0];
    } else if (!txDate || textLower.includes('today')) {
      txDate = currentDate.toISOString().split('T')[0];
    } else if (txDate.toLowerCase() === 'yesterday') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      txDate = d.toISOString().split('T')[0];
    }

    // 4. Robust Payment Method Extraction
    let payment = parsed.paymentMethod || 'UPI';
    if (textLower.includes('cash')) payment = 'CASH';
    else if (textLower.includes('card')) payment = 'CREDIT_CARD';
    else if (textLower.includes('upi') || textLower.includes('gpay') || textLower.includes('phonepe')) payment = 'UPI';

    return {
      amount: amountVal,
      categoryId: finalCategoryId,
      merchant: parsed.merchant || null,
      paymentMethod: payment,
      transactionDate: txDate,
      notes: parsed.notes || null,
      confidence: amountVal > 0 && finalCategoryId ? 0.9 : 0.5,
    };
  } catch (err) {
    throw new Error('Failed to parse AI response into structured data.');
  }
}

/**
 * Generate concise financial insights based on deterministic context
 */
export async function generateInsights(financialContext) {
  const contextString = JSON.stringify(financialContext, null, 2);
  
  const prompt = `You are a strict, direct data analysis bot. Analyze the user's financial data and output EXACTLY a 1-sentence headline, a blank line, and 2-3 specific bullet-point observations.
CRITICAL RULES:
1. Address the user directly (use "You", "Your"). Do NOT say "The student" or "Indian student".
2. Do NOT output any titles like "Financial Insights" or "=================". Just the headline and bullets.
3. ALL currency values MUST be in Indian Rupees (₹ or INR). NEVER use dollars ($).
4. Do NOT give investment, stock, or tax advice. Focus purely on observations about expenses, savings, goals, and budgets.
5. Reference actual numbers and percentages from the data. Be very concise.

Financial Data:
${contextString}

Output strictly the headline and the bullet points:`;

  const responseText = await callOllama(prompt);
  return responseText.trim();
}
