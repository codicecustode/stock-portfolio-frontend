import { Stock } from "../types/stock"

export default function SectorSummary({ stocks }: { stocks: Stock[] }) {

  const grouped = stocks.reduce((acc: any, s) => {
    if (!acc[s.sector]) acc[s.sector] = []
    acc[s.sector].push(s)
    return acc
  }, {})

  const summary = Object.entries(grouped).map(([sector, list]: any) => {
    const investment = list.reduce((sum: number, s: Stock) => sum + s.purchasePrice * s.quantity, 0)
    const present = list.reduce((sum: number, s: Stock) => sum + s.cmp * s.quantity, 0)

    return {
      sector,
      investment,
      gainLoss: present - investment,
    }
  })

  return (
    <div className="grid md:grid-cols-3 gap-4">

      {summary.map(s => (
        <div key={s.sector} className="p-4 bg-white rounded-xl shadow">

          <h3 className="font-semibold">{s.sector}</h3>

          <p>Investment: ₹{s.investment}</p>

          <p className={s.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
            Gain/Loss: ₹{s.gainLoss.toFixed(2)}
          </p>

        </div>
      ))}

    </div>
  )
}
