import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req: Request) => {
    // Manejo de CORS (Para permitir que tu web llame a esta función)
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { to, subject, html } = await req.json()
        console.log(`[Email Service] Iniciando envío a: ${to} | Asunto: ${subject}`);

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: to,
                subject: subject,
                html: html,
            }),
        })

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[Email Service] Error en API de Resend. Status: ${res.status}. Respuesta: ${errorText}`);
            throw new Error(`Error proveedor de email: ${res.status} ${errorText}`);
        }

        const data = await res.json()
        console.log(`[Email Service] Email enviado exitosamente. ID: ${data.id}`);

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })

    } catch (error: any) {
        console.error(`[Email Service] Error Crítico:`, error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    }
})
