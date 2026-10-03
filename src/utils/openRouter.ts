import { CoopSettings } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const API_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) || '';
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
}

export const isOpenRouterConfigured = (): boolean => {
    return Boolean(API_KEY && API_KEY.startsWith('sk-or-'));
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

import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * Send a chat completion request to OpenRouter (proxied via Supabase Edge Function if available).
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

    // 1. Production Secure Path: Proxy through Supabase Edge Function (keeps secret server-side)
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.functions.invoke('ai-assistant', {
                body: { messages, model: MODEL },
            });
            if (!error && data?.choices?.[0]?.message?.content) {
                return { success: true, content: data.choices[0].message.content.trim() };
            }
            // If Edge Function returned specific error, report it
            if (error) {
                console.warn('Supabase Edge Function ai-assistant unavailable, falling back:', error.message);
            }
        } catch (edgeErr) {
            console.warn('Edge function invoke error, falling back to local client:', edgeErr);
        }
    }

    // 2. Local Development Fallback: Direct client fetch using VITE_OPENROUTER_API_KEY
    if (!isOpenRouterConfigured()) {
        return {
            success: false,
            content: '',
            error: 'OpenRouter AI सेवा कन्फिगर गरिएको छैन। कृपया Supabase Edge Function वा VITE_OPENROUTER_API_KEY जाँच गर्नुहोस्।',
        };
    }

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://unako.coop',
                'X-Title': 'Unako SACCOS Digital Portal',
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                temperature: 0.5,
                max_tokens: 600,
            }),
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            return {
                success: false,
                content: '',
                error: `OpenRouter request failed (${response.status}): ${errText.slice(0, 200)}`,
            };
        }

        const data = await response.json();
        const content: string | undefined = data?.choices?.[0]?.message?.content;

        if (!content) {
            return {
                success: false,
                content: '',
                error: 'OpenRouter returned an empty response.',
            };
        }

        return { success: true, content: content.trim() };
    } catch (err) {
        return {
            success: false,
            content: '',
            error: err instanceof Error ? err.message : 'Unknown network error contacting OpenRouter.',
        };
    }
};