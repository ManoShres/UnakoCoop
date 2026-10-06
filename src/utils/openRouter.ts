import { CoopSettings } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * AI assistant transport.
 *
 * SECURITY: there is deliberately NO client-side provider API key path. The browser must
 * never hold an OpenRouter/LLM key — requests go exclusively through the Supabase Edge
 * Function proxy (`ai-assistant`), which keeps the secret server-side. When the edge
 * function is unavailable the assistant degrades gracefully to the caller's offline
 * rule-based fallback; it never falls back to a direct browser fetch with a bearer key.
 */

const MODEL =
    (import.meta.env.VITE_OPENROUTER_MODEL as string | undefined) ||
    'meta-llama/llama-3.3-70b-instruct';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface OpenRouterResponse {
    success: boolean;
    content: string;
    error?: string;
    /** True when the assistant is unavailable and the caller should use its offline fallback. */
    offline?: boolean;
}

export const isOpenRouterConfigured = (): boolean => {
    return isSupabaseConfigured() && Boolean(supabase);
};

/**
 * Knowledge base about the cooperative used to ground the AI assistant.
 */
const buildSystemPrompt = (coopSettings?: CoopSettings, lang: 'ne' | 'en' = 'ne'): string => {
    const name = coopSettings?.name || 'Unako Saving & Credit Cooperative Ltd.';
    const nameNepali = coopSettings?.nameNepali || 'उनको बचत तथा ऋण सहकारी संस्था लि.';
    const address = coopSettings?.address || 'Gadhwa-5, Chainpur, Dang, Nepal';
    const phone = coopSettings?.phone || '082-412055';
    const email = coopSettings?.email || 'info@unako.coop';
    const hours = coopSettings?.openingHours || 'Sunday - Friday, 10:00 AM - 4:00 PM';

    return `You are the 24/7 digital support assistant for ${name} (${nameNepali}), a community-based saving and credit cooperative (SACCOS) located in Dang, Nepal.

COOPERATIVE INFORMATION:
- Name: ${name}
- Address: ${address}
- Phone: ${phone}
- Email: ${email}
- Office Hours: ${hours}
- Service Centers: Gadhwa Central Office (082-412055), Lamahi Service Center (082-540122), Sisahaniya Service Center (082-580331)

LOAN PRODUCTS (interest rates, annual):
- Agriculture & Dairy Loan: 9.5% (subsidized 8.0% with Ministry of Agriculture rebate), max NPR 5,00,000, 36 months
- Women Entrepreneurship Loan: 7.0% (subsidized 5.5%), collateral-free micro-credit, max NPR 3,00,000, 24 months
- Emergency & Medical Loan: 10.5%, fast-track disbursement within 4 hours, max NPR 1,50,000, 18 months
- Higher Education Loan: 8.5%, grace period during study, max NPR 4,00,000, 48 months
- Micro Small Business Enterprise Loan: 11.0%, max NPR 10,00,000, 60 months

SAVINGS PRODUCTS:
- Regular Savings: 8.0% p.a. interest, quarterly credited
- Fixed Term Deposit (1 Year): 10.0% p.a.
- Fixed Term Deposit (3 Year): up to 11.5% p.a. with quarterly compounding
- Women Empowerment Fund and Child Education Savings also available

OTHER SERVICES:
- Membership: Apply online with citizenship + photo, verified within 24-48 hours. Members receive 10 kitta shares initially.
- Share capital top-up available online (par value NPR 100 per kitta)
- Annual dividend distribution (recent: 14.5%)
- Digital KYC verification
- 31st AGM: Asar 1, 2083 at Gadhwa Community Hall, Chainpur-5, Dang
- Digital entry passes & QR vouchers via Member Portal
- Payment rails: eSewa, Khalti, ConnectIPS (NCHL), Fonepay QR
- Online loan application with document upload via member portal
- Member grievance & helpdesk ticket tracker

GUIDELINES:
- Always be warm, respectful, concise, and helpful. Use "तपाईं" (formal you) in Nepali.
- ${lang === 'ne' ? 'The user is speaking Nepali. Respond primarily in Nepali (Devanagari script), but you may include English terms for technical/financial jargon.' : 'Respond primarily in English, but you may include Nepali terms where helpful.'}
- Keep answers to 2-4 short sentences unless more detail is truly needed.
- If asked about personal account balances, loan status, or transactions, explain they must log in to the Member Portal or call the office for security reasons.
- Never invent interest rates, branch addresses, or phone numbers not listed above. If unsure, direct them to call ${phone}.
- For complaints or formal grievances, advise submitting via the Member Grievance tracker or calling the office.
- Do not discuss topics unrelated to the cooperative, finance, or member services. Politely redirect off-topic conversations.`.trim();
};

/**
 * Send a chat completion request through the Supabase Edge Function proxy.
 *
 * There is no client-key fallback: when the proxy is unconfigured or unavailable the
 * caller receives a graceful `offline` result so it can use its own rule-based replies.
 */
export const chatWithOpenRouter = async (
    history: ChatMessage[],
    coopSettings?: CoopSettings,
    lang: 'ne' | 'en' = 'ne'
): Promise<OpenRouterResponse> => {
    const messages: ChatMessage[] = [
        { role: 'system', content: buildSystemPrompt(coopSettings, lang) },
        ...history,
    ];

    if (!isSupabaseConfigured() || !supabase) {
        return {
            success: false,
            content: '',
            error: 'AI assistant unavailable: secure proxy not configured.',
            offline: true,
        };
    }

    try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: { messages, model: MODEL },
        });
        if (!error && data?.choices?.[0]?.message?.content) {
            return { success: true, content: data.choices[0].message.content.trim() };
        }
        // Do NOT surface provider/edge error payloads — they can echo request metadata.
        console.warn('[assistant] secure proxy returned no usable completion; using offline fallback.');
        return {
            success: false,
            content: '',
            error: 'AI assistant unavailable: secure proxy error.',
            offline: true,
        };
    } catch {
        console.warn('[assistant] secure proxy unreachable; using offline fallback.');
        return {
            success: false,
            content: '',
            error: 'AI assistant unavailable: secure proxy unreachable.',
            offline: true,
        };
    }
};