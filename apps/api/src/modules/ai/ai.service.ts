import { prisma } from "@hostiq/database";

// ─────────────────────────────────────────────────────────
// AI Service Layer — Provider-agnostic, prompt-template-driven
// ─────────────────────────────────────────────────────────

export interface AiProviderConfig {
  provider: "anthropic" | "openai" | "azure";
  apiKey: string;
  model: string;
}

export interface AiCompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompletionResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ── Provider abstraction ────────────────────────────────

function getProviderConfig(): AiProviderConfig {
  return {
    provider: (process.env.AI_PROVIDER as AiProviderConfig["provider"]) || "anthropic",
    apiKey: process.env.AI_API_KEY || "",
    model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
  };
}

/**
 * Core completion function. In production, this calls the configured AI provider.
 * Currently returns a structured placeholder that demonstrates the integration pattern.
 * Swap the implementation body to call Anthropic, OpenAI, or Azure.
 */
export async function complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
  const config = getProviderConfig();

  if (!config.apiKey) {
    // Return structured placeholder when no API key configured
    return {
      content: `[AI response placeholder — configure AI_API_KEY to enable]\n\nSystem: ${request.systemPrompt.slice(0, 100)}...\nUser: ${request.userPrompt.slice(0, 200)}...`,
      model: config.model,
    };
  }

  // ── Anthropic ──────────────────────────────────────
  if (config.provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: request.maxTokens || 1024,
        system: request.systemPrompt,
        messages: [{ role: "user", content: request.userPrompt }],
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${err}`);
    }

    const data = await response.json() as any;
    return {
      content: data.content[0]?.text || "",
      model: data.model,
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
      },
    };
  }

  // ── OpenAI ─────────────────────────────────────────
  if (config.provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: request.maxTokens || 1024,
        temperature: request.temperature ?? 0.7,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${err}`);
    }

    const data = await response.json() as any;
    return {
      content: data.choices[0]?.message?.content || "",
      model: data.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
    };
  }

  throw new Error(`Unsupported AI provider: ${config.provider}`);
}

// ── Template engine ─────────────────────────────────────

/**
 * Loads a prompt template from the database and interpolates variables.
 * Falls back to system-wide defaults if no company-specific template exists.
 */
export async function executeTemplate(
  slug: string,
  variables: Record<string, string>,
  companyId?: string,
): Promise<AiCompletionResponse> {
  // Try company-specific template first, then system default
  const template = await prisma.promptTemplate.findFirst({
    where: {
      slug,
      isActive: true,
      OR: [
        { companyId: companyId || undefined },
        { companyId: null },
      ],
    },
    orderBy: [
      { companyId: "desc" }, // Company-specific takes priority
      { version: "desc" },
    ],
  });

  if (!template) {
    throw new Error(`Prompt template not found: ${slug}`);
  }

  // Interpolate variables
  let systemPrompt = template.systemPrompt;
  let userPrompt = template.userPrompt;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    systemPrompt = systemPrompt.replaceAll(placeholder, value);
    userPrompt = userPrompt.replaceAll(placeholder, value);
  }

  return complete({
    systemPrompt,
    userPrompt,
    temperature: template.temperature,
    maxTokens: template.maxTokens,
  });
}

// ── Domain-specific AI functions ────────────────────────

export async function generateFollowUpEmail(params: {
  guestName: string;
  guestTitle: string;
  guestCompany: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  eventNotes: string;
  dealStage: string;
  talkingPoints: string;
  nextStep: string;
  companyId?: string;
}): Promise<string> {
  const result = await executeTemplate("follow-up-email", params, params.companyId);
  return result.content;
}

export async function generateGuestPrioritization(params: {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  priority: string;
  objective: string;
  availableSeats: string;
  guestList: string;
  companyId?: string;
}): Promise<string> {
  const result = await executeTemplate("guest-prioritization", params, params.companyId);
  return result.content;
}

export async function generateConversationSummary(params: {
  guestName: string;
  guestCompany: string;
  homeTeam: string;
  awayTeam: string;
  notes: string;
  companyId?: string;
}): Promise<string> {
  const result = await executeTemplate("conversation-summary", params, params.companyId);
  return result.content;
}

export async function generateRoiInsights(params: {
  seasonName: string;
  totalSpend: string;
  totalGuests: string;
  attendanceRate: string;
  dealsInfluenced: string;
  revenueAttributed: string;
  topMatches: string;
  underutilizedMatches: string;
  conversionBySegment: string;
  companyId?: string;
}): Promise<string> {
  const result = await executeTemplate("roi-insight", params, params.companyId);
  return result.content;
}
