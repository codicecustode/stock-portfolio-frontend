import PortfolioTable from "@/components/PortfolioTable";

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-grey-900 pt-10">
      <PortfolioTable />
    </div>
  );
}
