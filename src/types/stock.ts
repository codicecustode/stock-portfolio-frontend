export type Stock = {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  purchasePrice: number;
  quantity: number;
  cmp: number;
  peRatio: number;
  earnings: string;
};

export type ComputedStock = Stock & {
  investment: number;
  presentValue: number;
  gainLoss: number;
  returnPercent: string;
  portfolioPercent: string;
};

export type SectorData = {
  sector: string;
  stocks: ComputedStock[];
  totalInvestment: number;
  totalValue: number;
  sectorGain: number;
  sectorReturn: string;
};
