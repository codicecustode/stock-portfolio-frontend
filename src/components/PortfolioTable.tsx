"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Stock, ComputedStock, SectorData } from "../types/stock";
import { localStocks } from "../stocks/stockData";

const ModernPortfolioTable = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  // Fetch data
  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const payload = {
        stocks: localStocks.map((s) => ({ symbol: s.symbol })),
      };
      
      const res = await fetch("https://stock-portfolio-backend-xqnz.onrender.com/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("Backend response status:", res.status);

      const liveData = await res.json();

      //combine live prices with local details
      const combinedStockData = localStocks.map((stock) => {
        const live = liveData.find((l: any) => l.symbol === stock.symbol);

        return {
          ...stock,
          cmp: live?.cmp ?? stock.cmp,
          peRatio: live?.peRatio ?? stock.peRatio,
          earnings: live?.earnings ?? stock.earnings,
        };
      });

      setStocks(combinedStockData);
    } catch (err) {
      console.error("Failed to fetch live data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load on mount
    fetchData();

    // Auto-refresh every 60 seconds (match comment)
    const interval = setInterval(fetchData, 60000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []); 

  // Compute stock data with calculations
  const computedStocks = useMemo<ComputedStock[]>(() => {
    const totalInvestment = stocks.reduce(
      (sum, s) => sum + s.purchasePrice * s.quantity,
      0,
    );

    return stocks.map((stock) => {
      const investment = stock.purchasePrice * stock.quantity;
      const presentValue = stock.cmp * stock.quantity;
      const gainLoss = presentValue - investment;
      const returnPercent = ((gainLoss / investment) * 100).toFixed(2);
      const portfolioPercent = ((investment / totalInvestment) * 100).toFixed(
        2,
      );

      return {
        ...stock,
        investment,
        presentValue,
        gainLoss,
        returnPercent,
        portfolioPercent,
      };
    });
  }, [stocks]);

  // Group stocks by sector
  const sectorData = useMemo<SectorData[]>(() => {
    const grouped: Record<string, ComputedStock[]> = {};

    computedStocks.forEach((stock) => {
      if (!grouped[stock.sector]) {
        grouped[stock.sector] = [];
      }
      grouped[stock.sector].push(stock);
    });

    return Object.entries(grouped).map(([sector, stocks]) => {
      const totalInvestment = stocks.reduce((sum, s) => sum + s.investment, 0);
      const totalValue = stocks.reduce((sum, s) => sum + s.presentValue, 0);
      const sectorGain = totalValue - totalInvestment;
      const sectorReturn = ((sectorGain / totalInvestment) * 100).toFixed(2);

      return {
        sector,
        stocks,
        totalInvestment,
        totalValue,
        sectorGain,
        sectorReturn,
      };
    });
  }, [computedStocks]);

  // Dynamic color generation
  const generateSectorColor = (sector: string): string => {
    const colors = [
      "from-blue-600 to-blue-500",
      "from-purple-600 to-purple-500",
      "from-green-600 to-green-500",
      "from-orange-600 to-orange-500",
      "from-pink-600 to-pink-500",
      "from-indigo-600 to-indigo-500",
      "from-teal-600 to-teal-500",
      "from-cyan-600 to-cyan-500",
      "from-red-600 to-red-500",
      "from-amber-600 to-amber-500",
    ];

    const hash = sector
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Define columns using TanStack React Table
  const columnHelper = createColumnHelper<ComputedStock>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Stock",
      cell: (info) => (
        <div className="min-w-[120px]">
          <div className="font-semibold text-slate-900 truncate">
            {info.getValue()}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {info.row.original.symbol}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("purchasePrice", {
      header: "Buy Price",
      cell: (info) => (
        <span className="font-medium text-slate-700 whitespace-nowrap">
          ₹{info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("quantity", {
      header: "Qty",
      cell: (info) => (
        <span className="inline-flex items-center justify-center px-3 py-1 bg-slate-200 text-slate-700 text-sm font-semibold rounded-full">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("investment", {
      header: "Investment",
      cell: (info) => (
        <span className="font-semibold text-slate-900 whitespace-nowrap">
          ₹{info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("portfolioPercent", {
      header: "Portfolio %",
      cell: (info) => {
        const percent = parseFloat(info.getValue());
        const sector = info.row.original.sector;
        return (
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <span className="text-sm font-medium text-slate-700">
              {info.getValue()}%
            </span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${generateSectorColor(sector)} transition-all`}
                style={{ width: `${Math.min(percent * 2, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("exchange", {
      header: "Exchange",
      cell: (info) => (
        <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("cmp", {
      header: "CMP",
      cell: (info) => (
        <span className="font-medium text-slate-700 whitespace-nowrap">
          ₹{info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("presentValue", {
      header: "Present Value",
      cell: (info) => (
        <span className="font-semibold text-slate-900 whitespace-nowrap">
          ₹{info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("peRatio", {
      header: "P/E Ratio",
      cell: (info) => (
        <span className="text-sm font-medium text-slate-700">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("earnings", {
      header: "Latest Earnings",
      cell: (info) => (
        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("gainLoss", {
      header: "Gain/Loss",
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="flex items-center justify-end gap-1.5 min-w-[100px]">
            {value >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span
              className={`font-bold whitespace-nowrap ${value >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              ₹{Math.abs(value).toLocaleString()}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("returnPercent", {
      header: "Returns %",
      cell: (info) => {
        const value = parseFloat(info.getValue());
        return (
          <span
            className={`inline-flex items-center px-3 py-1.5 font-bold text-sm rounded-lg whitespace-nowrap ${
              value >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {value >= 0 ? "+" : ""}
            {info.getValue()}%
          </span>
        );
      },
    }),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Portfolio Overview  {isLoading && <span className="text-sm font-normal text-slate-500 ml-2">Loading...</span>}
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Grouped by sector with real-time performance
          </p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Scrollable Wrapper */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300">
            <table className="w-full min-w-[1000px] border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                  {columns.map((column) => (
                    <th
                      key={column.header?.toString()}
                      className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold whitespace-nowrap uppercase tracking-wider"
                    >
                      {typeof column.header === "string" ? column.header : ""}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sectorData.map((sectorInfo) => (
                  <SectorBlock
                    key={sectorInfo.sector}
                    sectorInfo={sectorInfo}
                    columns={columns}
                    generateSectorColor={generateSectorColor}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

function SectorBlock({
  sectorInfo,
  columns,
  generateSectorColor,
}: {
  sectorInfo: SectorData;
  columns: any[];
  generateSectorColor: (sector: string) => string;
}) {
  const table = useReactTable({
    data: sectorInfo.stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* Sector Header Row */}
      <tr
        className={`bg-gradient-to-r ${generateSectorColor(sectorInfo.sector)} sticky left-0 z-10`}
      >
        <td colSpan={8} className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full shrink-0"></div>
              <span className="text-white font-bold text-base md:text-lg whitespace-nowrap">
                {sectorInfo.sector} Sector
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white text-xs md:text-sm opacity-90">
              <span className="whitespace-nowrap">
                Invested: ₹{sectorInfo.totalInvestment.toLocaleString()}
              </span>
              <span className="whitespace-nowrap">
                Current: ₹{sectorInfo.totalValue.toLocaleString()}
              </span>
            </div>
          </div>
        </td>

        <td colSpan={4} className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-end gap-2 text-white">
            {sectorInfo.sectorGain >= 0 ? (
              <TrendingUp className="w-4 h-4 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 shrink-0" />
            )}
            <span className="font-bold text-sm md:text-base whitespace-nowrap">
              ₹{Math.abs(sectorInfo.sectorGain).toLocaleString()} (
              {parseFloat(sectorInfo.sectorReturn) >= 0 ? "+" : ""}
              {sectorInfo.sectorReturn}%)
            </span>
          </div>
        </td>
      </tr>

      {/* Stock Rows */}
      {table.getRowModel().rows.map((row, stockIndex) => {
        const isEven = stockIndex % 2 === 0;

        return (
          <tr
            key={row.id}
            className={`
              ${isEven ? "bg-slate-50/50" : "bg-white"}
              hover:bg-blue-50/50
              transition-colors
              border-b border-slate-100
            `}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className="px-4 py-3 md:px-6 md:py-4 text-center first:text-left text-sm"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}

export default ModernPortfolioTable;
