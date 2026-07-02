import { NextResponse } from 'next/server'

export const revalidate = 30

const SYMS = [
  { sym: '^FCHI',     label: 'CAC 40'        },
  { sym: '^STOXX50E', label: 'Euro Stoxx 50' },
  { sym: '^DJI',      label: 'Dow Jones'     },
  { sym: '^GSPC',     label: 'S&P 500'       },
  { sym: '^IXIC',     label: 'Nasdaq'        },
  { sym: 'EURUSD=X',  label: 'EUR/USD'       },
  { sym: 'GC=F',      label: 'Or'            },
  { sym: 'BTC-USD',   label: 'Bitcoin'       },
  { sym: '^N225',     label: 'Nikkei 225'    },
  { sym: '^FTSE',     label: 'FTSE 100'      },
  { sym: 'MC.PA',     label: 'LVMH'          },
  { sym: 'RMS.PA',    label: 'Hermès'        },
]

export async function GET() {
  const results = await Promise.allSettled(
    SYMS.map(async s => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.sym)}?range=1d&interval=1d`
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 30 },
      })
      if (!r.ok) throw new Error(`${s.sym}: ${r.status}`)
      const d = await r.json()
      const m = d.chart.result[0].meta
      const price: number = m.regularMarketPrice
      const prev: number = m.chartPreviousClose || m.previousClose
      return { label: s.label, sym: s.sym, price, pct: ((price - prev) / prev) * 100 }
    }),
  )
  const items = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<{ label: string; sym: string; price: number; pct: number }>).value)

  return NextResponse.json(items, {
    headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
  })
}
