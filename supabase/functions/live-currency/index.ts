import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Örnek public API üzerinden döviz kurları ve BTC çekimi yapabiliriz
    // Gerçek senaryoda bu tarz API'lar için API Key'i supabase secrets ile tutarız (Deno.env.get('API_KEY'))
    const targetCurrencies = ["USD", "EUR", "BTC", "XAU"]; 
    
    // Simüle edilmiş canlı kur cevapları objesi
    const mockLiveRates = {
      "USD_TRY": 32.55,
      "EUR_TRY": 35.10,
      "BTC_TRY": 2185000.00,
      "XAU_TRY": 2450.50, // Gram Altın
      "timestamp": new Date().toISOString()
    };

    return new Response(
      JSON.stringify(mockLiveRates),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
