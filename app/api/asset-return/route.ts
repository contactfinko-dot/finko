import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 3600

// Actifs votables dans le radar de sentiment → symbole Yahoo Finance
const ASSET_SYMBOLS: Record<string, string> = {
  'CAC 40': '^FCHI',
  'BITCOIN': 'BTC-USD',
  'BTC': 'BTC-USD',
  'S&P 500': '^GSPC',
  'SP 500': '^GSPC',
  'NASDAQ': '^IXIC',
  'DOW JONES': '^DJI',
  'EUR/USD': 'EURUSD=X',
  'OR': 'GC=F',
  'NIKKEI 225': '^N225',
  'FTSE 100': '^FTSE',
  'LVMH': 'MC.PA',
  'HERMÈS': 'RMS.PA',
  'HERMES': 'RMS.PA',
  'EURO STOXX 50': '^STOXX50E',
  'ETF WORLD': 'IWDA.AS',
  'MSCI WORLD': 'IWDA.AS',
  'SCPI': '',
}

export async function GET(req: NextRequest) {
  const asset = (req.nextUrl.searchParams.get('asset') || '').toUpperCase().trim()
  const sym = ASSET_SYMBOLS[asset]
  if (!sym) return NextResponse.json({ pct: null, reason: 'unknown-asset' })

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1mo&interval=1wk`
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    })
    const d = await r.json()
    const q = d.chart.result[0].indicators.quote[0]
    const closes: (number | null)[] = q.close
    const opens: (number | null)[] = q.open
    const n = closes.length
    if (n < 2) return NextResponse.json({ pct: null, reason: 'no-data' })
    // Avant-dernière bougie = dernière semaine complète
    const i = n >= 3 ? n - 2 : n - 1
    const o = opens[i] || closes[i - 1]
    const c = closes[i]
    if (!o || !c) return NextResponse.json({ pct: null, reason: 'no-data' })
    return NextResponse.json({ pct: ((c - o) / o) * 100 })
  } catch {
    return NextResponse.json({ pct: null, reason: 'fetch-error' })
  }
}
