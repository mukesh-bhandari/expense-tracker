import HistoryAndAnalytics from "../../features/expense/DisplayExpense";
import Navbar from "../../features/expense/Navbar";

export default function HistoryAndAnalyticsPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 ">
        <HistoryAndAnalytics />

        {/* QR Codes Section */}
        <div className="  p-8 mt-5">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Payment QR Codes
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {["mukesh", "aadarsh", "kushal", "niraj"].map((person) => (
              <div key={person} className="flex flex-col items-center gap-4">
                <div className=" bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-border">
                  <img
                    src={`/${person}.jpg`}
                    alt={`${person} QR Code`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<p class="text-sm text-muted-foreground">No QR</p>';
                    }}
                  />
                </div>
                <p className="text-base text-muted-foreground capitalize font-medium">
                  {person}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
