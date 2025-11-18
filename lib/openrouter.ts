import type { BaselineSpec, RequirementsPayload } from "./rules";

export type AiSummary = {
  bestFitConfiguration: string;
  priceEstimate: string;
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
  requirements: RequirementsPayload,
  baseline: BaselineSpec
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
      // Keep this intentionally modest so it fits free / low-credit accounts.
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "You are a senior enterprise hardware architect who turns structured procurement requirements into succinct summaries. Always answer in strict JSON with snake_case keys exactly as follows: {\"best_fit_configuration\": string, \"price_estimate\": string, \"reasoning\": string, \"bulk_scaling\": string, \"alternatives\": [{\"tier\": \"higher\"|\"lower\"|\"lateral\", \"summary\": string}]}",
        },
        {
          role: "user",
          content: JSON.stringify({
            requirements,
            baseline,
            instructions:
              "Use the baseline spec as the foundation, adjust where it makes sense, and keep recommendations enterprise-ready. Keep each field concise (1–4 sentences max).",
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
      bestFitConfiguration: parsed.best_fit_configuration,
      priceEstimate: parsed.price_estimate,
      reasoning: parsed.reasoning,
      bulkScaling: parsed.bulk_scaling,
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

