import HistoryAndAnalytics from "../../features/expense/DisplayExpense";
import Navbar from "../../features/expense/Navbar";

export default function HistoryAndAnalyticsPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <HistoryAndAnalytics />
      </main>
    </>
  );
}
