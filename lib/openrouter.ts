import type { RequirementsPayload } from "./rules";

export type AiSummary = {
  bestFitConfiguration: string;
  priceEstimate: string;
  unitPrice: string;
  totalPrice: string;
  reasoning: string;
  bulkScaling: string;
};

const OPENROUTER_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "tngtech/deepseek-r1t2-chimera:free";

// parseCompletionContent removed — message content will be handled directly where used

export const getOpenRouterSummary = async (
  requirements: RequirementsPayload
): Promise<AiSummary> => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://hardwareconfigurator.local",
      "X-Title": "Hardware Configurator",
    },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        // Increased tokens for more detailed responses
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content:
              "return strict JSON with snake_case keys exactly as follows: {\"best_fit_configuration\": string (component breakdown), \"price_estimate\": string (price per component), \"unit_price\": string (single unit price in USD like \"$1,250.00\"), \"total_price\": string (total for all units in USD like \"$25,000.00\"), \"reasoning\": string (brief explanation why each component fits the use case), \"bulk_scaling\": string (short notes on bulk procurement)}.",
          },
          {
            role: "user",
            content: JSON.stringify({
              requirements,
              instructions:
                "based on the requirements sent return strict json",
            }),
          },
        ],        
        temperature: 0.4,
      }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${errorPayload}`);
  }

  const payload = await response.json();
  // Log the raw JSON payload returned from OpenRouter for debugging
  try {
    // payload received (not logged)
  } catch (e) {
    // payload non-serializable (not logged)
  }
  const message = payload?.choices?.[0]?.message;
  const rawContent = message?.content;
  const text = typeof rawContent === "string" ? rawContent : rawContent !== undefined ? JSON.stringify(rawContent) : "";
  // Additional granular logs removed

  // Normalize the text by removing surrounding markdown code fences if present
  const cleanResponseText = (input: string) => {
    const t = input?.trim();
    if (!t) return "";

    // If the response is wrapped in a fenced code block like ```json\n{...}\n```
    if (t.startsWith("```")) {
      // Remove the leading fence and optional language tag
      const withoutLeading = t.replace(/^```[a-zA-Z]*\n?/, "");
      // Remove the trailing fence if present
      const withoutTrailing = withoutLeading.replace(/\n?```$/, "");
      return withoutTrailing.trim();
    }

    return t;
  };

  const cleanedText = cleanResponseText(text);
  // Cleaned text available in `cleanedText`

  try {
  const parsed = JSON.parse(cleanedText);
  // Parsed JSON available in `parsed`
    return {
      bestFitConfiguration: parsed.best_fit_configuration || "",
      priceEstimate: parsed.price_estimate || "",
      unitPrice: parsed.unit_price || parsed.price_estimate || "Price on request",
      totalPrice: parsed.total_price || "Price on request",
      reasoning: parsed.reasoning || "",
      bulkScaling: parsed.bulk_scaling || "",
    };
  } catch (error) {
    throw new Error(
      `Unable to parse OpenRouter response as JSON. Raw content: ${text}. Error: ${String(
        error
      )}`
    );
  }
};

