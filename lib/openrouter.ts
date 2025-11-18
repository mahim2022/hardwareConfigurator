import type { RequirementsPayload } from "./rules";

export type AiSummary = {
  bestFitConfiguration: string;
  priceEstimate: string;
  unitPrice: string;
  totalPrice: string;
  reasoning: string;
  bulkScaling: string;
  alternatives: { tier: "higher" | "lower" | "lateral"; summary: string }[];
};

const OPENROUTER_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";

const parseCompletionContent = (content: unknown): string => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object" && "text" in entry) {
          return String(entry.text);
        }
        return "";
      })
      .join("\n");
  }

  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text: unknown }).text ?? "");
  }

  return "";
};

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
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content:
              "You are a senior enterprise hardware architect with deep knowledge of current market prices, component availability, and procurement best practices. You conduct thorough research on latest hardware prices from major vendors (Dell, HP, Lenovo, etc.) and provide detailed, accurate pricing information. Always answer in strict JSON with snake_case keys exactly as follows: {\"best_fit_configuration\": string (detailed component breakdown), \"price_estimate\": string (detailed price breakdown per component), \"unit_price\": string (single unit price in USD format like \"$1,250.00\"), \"total_price\": string (total for all units in USD format like \"$25,000.00\"), \"reasoning\": string (detailed explanation of choices), \"bulk_scaling\": string (detailed bulk procurement notes), \"alternatives\": [{\"tier\": \"higher\"|\"lower\"|\"lateral\", \"summary\": string}]}. IMPORTANT: Research and provide current market prices. Calculate total_price based on the quantity specified in requirements. Be specific with component models, prices, and vendor recommendations.",
          },
          {
            role: "user",
            content: JSON.stringify({
              requirements,
              instructions:
                "Based solely on the user requirements provided, conduct deep research on latest hardware prices from major enterprise vendors (Dell, HP, Lenovo, etc.). Generate a complete hardware configuration from scratch that best matches the requirements. Provide detailed component-level pricing with specific model numbers. Calculate both unit_price (per device) and total_price (for the entire quantity specified). For gaming PCs, ensure software requirements include gaming capabilities. Be thorough and accurate with pricing research - use real current market prices. Provide detailed reasoning for each component choice. Consider all requirements including usage type, budget range, quantity, form factor, required software, brand constraints, performance priority, storage, networking, durability, warranty, power efficiency, and compliance needs.",
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
  const message = payload?.choices?.[0]?.message;
  const text = parseCompletionContent(message?.content);

  try {
    const parsed = JSON.parse(text);
    return {
      bestFitConfiguration: parsed.best_fit_configuration || "",
      priceEstimate: parsed.price_estimate || "",
      unitPrice: parsed.unit_price || parsed.price_estimate || "Price on request",
      totalPrice: parsed.total_price || "Price on request",
      reasoning: parsed.reasoning || "",
      bulkScaling: parsed.bulk_scaling || "",
      alternatives: Array.isArray(parsed.alternatives)
        ? parsed.alternatives.map((alt: { tier: string; summary: string }) => ({
            tier: (alt.tier as AiSummary["alternatives"][number]["tier"]) ?? "lateral",
            summary: alt.summary,
          }))
        : [],
    };
  } catch (error) {
    throw new Error(
      `Unable to parse OpenRouter response as JSON. Raw content: ${text}. Error: ${String(
        error
      )}`
    );
  }
};

