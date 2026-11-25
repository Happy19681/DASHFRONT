import { useOutletContext } from "react-router";
import RecentTransactionsTable from "@/features/dashboard/components/RecentTransactionsTable";

function TransactionsPage() {
  const { searchQuery } = useOutletContext();
  return (
    <main className="w-full p-6 md:p-8">
      <p className="mb-1 text-xs text-gray-500">Dashboard</p>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Transactions</h1>
      <p className="mt-1 text-sm text-gray-500">Manage transaction records and their status.</p>
      <RecentTransactionsTable globalSearchQuery={searchQuery} />
    </main>
  );
}

export default TransactionsPage;
