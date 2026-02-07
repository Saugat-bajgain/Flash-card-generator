

const { parseArgs } = require("node:util");
const path = require("node:path");
const { readFile } = require("node:fs/promises");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const OpenAI = require("openai");

// ------------------ IDENTITY HEADER ------------------
function printHeader() {
  console.log("========================================");
  console.log("Name: Saugat Bajgain");
  console.log("Course: AIP444");
  console.log("Lab: 02 - SQR Flashcard Generator");
  console.log("========================================\n");
}

// ------------------ ARG PARSING ------------------
function parseArguments() {
  const options = {
    count: { type: "string", short: "c", default: "3" },
  };

  let values, positionals;
  try {
    ({ values, positionals } = parseArgs({ options, allowPositionals: true }));
  } catch (err) {
    console.error("❌ Error parsing arguments:", err.message);
    process.exit(1);
  }

  if (positionals.length === 0) {
    console.error("❌ Error: Please provide a path to notes file");
    console.error("Usage: node flashcard-gen.js <notes-path> [--count N]");
    process.exit(1);
  }

  const notesPath = positionals[0];
  const count = parseInt(values.count, 10);

  if (Number.isNaN(count) || count < 1 || count > 5) {
    console.error("❌ Error: --count must be between 1 and 5");
    process.exit(1);
  }

  return { notesPath, count };
}

// ------------------ file helpers ------------------
async function getFileContents(filePath, description) {
  try {
    return await readFile(filePath, "utf-8");
  } catch (err) {
    console.error(`❌ Error: ${description} not found/readable: ${filePath}`);
    console.error(`   ${err.message}`);
    process.exit(1);
  }
}

// ------------------ PROMPT BUILDERS ------------------
function buildUserPrompt(notesContent, count) {
  return `
Generate SQR flashcards using ONLY the notes inside <NOTES>...</NOTES>.

HARD REQUIREMENTS:
- If the notes contain enough info: generate EXACTLY ${count} cards.
- Otherwise: generate as many valid cards as possible, then print:
  "⚠️ Only generated X card(s) because:" with bullet reasons.
- NO hallucinations. Use only what appears in the notes.
- Every card MUST include REFERENCE as an EXACT quote from the notes.
- QUESTION must expand acronyms (e.g., Large Language Model (LLM)).
- Output ONLY SQR cards (and optional insufficiency message at the end).
- Each card MUST start with "=== CARD N ===" and end with "===".
- Cards MUST be numbered sequentially.

<NOTES>
${notesContent}
</NOTES>

Now output the flashcards.`;
}


function buildRepairPrompt(notesContent, count, badOutput) {
  return `
You must ONLY output properly formatted SQR cards.

Task:
- Reformat the content into valid SQR cards.
- Output EXACTLY ${count} cards if the notes support it; otherwise output as many as supported and then:
  "⚠️ Only generated X card(s) because:" with bullet reasons.
- Use ONLY information from <NOTES>.
- Every card MUST include REFERENCE as an EXACT quote copied from <NOTES>.
- Cards MUST be numbered sequentially starting at 1.
- Each card MUST start with "=== CARD N ===" and end with "===".
- Output ONLY cards (and optional insufficiency message at the end). No extra text.

<NOTES>
${notesContent}
</NOTES>

Here is the previous model output that needs reformatting (do NOT treat it as truth unless it is supported by NOTES):
<PREVIOUS_OUTPUT>
${badOutput}
</PREVIOUS_OUTPUT>

Now output the corrected cards.`;
}

// ----------------- OUTPUT EXTRACTION -----------------
function extractCards(text) {
  const cardRegex = /=== CARD \d+ ===.*?===/gs;
  return text.match(cardRegex) || [];
}

function extractTailMessage(text) {
  const last = text.lastIndexOf("===");
  if (last === -1) return "";
  return text.slice(last + 3).trim();
}

// ----------------- MODEL CALL -----------------
async function callOpenRouter({ systemPrompt, userPrompt, model }) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || !apiKey.startsWith("sk-or-")) {
    console.error("❌ Error: OPENROUTER_API_KEY is missing or invalid in .env");
    process.exit(1);
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });

  return client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });
}

async function main() {
  printHeader();

  const { notesPath, count } = parseArguments();

  const systemPrompt = await getFileContents(
    path.resolve(__dirname, "INSTRUCTIONS.md"),
    "System prompt file (INSTRUCTIONS.md)"
  );

  const notesFullPath = path.resolve(process.cwd(), notesPath);
  const notesContent = await getFileContents(notesFullPath, "Notes file");

  if (!notesContent || notesContent.trim().length < 10) {
    console.log("❌ Cannot generate SQR flashcards:");
    console.log("- Notes file is empty or too short.");
    console.log("- Add more detailed notes (definitions, explanations, examples).");
    process.exit(0);
  }

  const primaryModel = "meta-llama/llama-3.3-70b-instruct:free";
  const fallbackModel = "meta-llama/llama-3.3-70b-instruct";

  const userPrompt = buildUserPrompt(notesContent, count);

  let output = "";
  try {
    const completion = await callOpenRouter({
      systemPrompt,
      userPrompt,
      model: primaryModel,
    });
    output = completion.choices?.[0]?.message?.content || "";
  } catch (err) {
    const msg = String(err?.message || err);
    const status = err?.status || err?.response?.status;

    if (status === 429 || msg.includes("429") || msg.toLowerCase().includes("rate")) {
      console.log("⚠️ Rate limited on free model. Retrying with paid model...\n");
      const completion = await callOpenRouter({
        systemPrompt,
        userPrompt,
        model: fallbackModel,
      });
      output = completion.choices?.[0]?.message?.content || "";
    } else {
      console.error("❌ OpenRouter request failed:");
      console.error(msg);
      process.exit(1);
    }
  }

  let cards = extractCards(output);

  if (cards.length < Math.min(count, 3)) {
    const repairPrompt = buildRepairPrompt(notesContent, count, output);

    let repaired = "";
    try {
      const completion2 = await callOpenRouter({
        systemPrompt,
        userPrompt: repairPrompt,
        model: fallbackModel, 
      });
      repaired = completion2.choices?.[0]?.message?.content || "";
    } catch (err) {
    
      repaired = "";
    }

    if (repaired) {
      const repairedCards = extractCards(repaired);
      if (repairedCards.length > cards.length) {
        output = repaired;
        cards = repairedCards;
      }
    }
  }

  if (!cards.length) {
    const trimmed = output.trim();
    if (
      trimmed.startsWith("❌ Cannot generate SQR flashcards:") ||
      trimmed.startsWith("Cannot generate SQR flashcards:") ||
      trimmed.startsWith("⚠️ Only generated")
    ) {
      console.log(trimmed);
      process.exit(0);
    }

    console.log("❌ No cards found in output.");
    console.log("\n--- Raw model output (for debugging) ---\n");
    console.log(output);
    process.exit(1);
  }

  console.log(`✅ Generated ${cards.length} flashcard(s):\n`);
  cards.forEach((card) => {
    console.log(card);
    console.log();
  });

  if (cards.length < count) {
    const tail = extractTailMessage(output);
    if (tail) console.log(tail);
  }
}

main();
