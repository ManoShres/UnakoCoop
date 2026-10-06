// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This Edge Function safely proxies OpenRouter AI requests without exposing API keys to the browser bundle.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const ALLOWED_MODELS = new Set([
  "meta-llama/llama-3.3-70b-instruct",
  "meta-llama/llama-3.1-8b-instruct",
]);
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct";
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Reject requests without authentication header / API key
  const authHeader = req.headers.get("Authorization") || req.headers.get("apikey");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Missing authorization header or apikey." }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: OPENROUTER_API_KEY is not configured on Edge Function." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, model } = body as { messages?: unknown; model?: unknown };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array is required and must not be empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: `Invalid request: maximum ${MAX_MESSAGES} messages allowed in conversation history.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize and validate messages
    const sanitizedMessages: Array<{ role: string; content: string }> = [];
    for (const msg of messages) {
      if (!msg || typeof msg !== "object") continue;
      const m = msg as { role?: unknown; content?: unknown };
      const role = String(m.role || "");
      if (role !== "system" && role !== "user" && role !== "assistant") {
        return new Response(
          JSON.stringify({ error: "Invalid message role. Must be 'system', 'user', or 'assistant'." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const rawContent = typeof m.content === "string" ? m.content : "";
      if (rawContent.length > MAX_CONTENT_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Message exceeds maximum allowed length of ${MAX_CONTENT_LENGTH} characters.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      sanitizedMessages.push({ role, content: rawContent });
    }

    // Enforce model whitelist to prevent credit drain on expensive models
    const selectedModel = typeof model === "string" && ALLOWED_MODELS.has(model)
      ? model
      : DEFAULT_MODEL;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://unako.coop",
        "X-Title": "Unako SACCOS AI Assistant",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: sanitizedMessages,
        temperature: 0.5,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "AI provider service returned an error. Please try again later." }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Internal Server Error in AI proxy." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
