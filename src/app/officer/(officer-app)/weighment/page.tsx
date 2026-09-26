import WeighmentPanel from "@/components/officer/WeighmentPanel";

export default function WeighmentPage() {
  return (
    <main className="officer-page-shell">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">तौल एवं भुगतान</h1>
        <p className="mt-1 text-sm font-bold text-gray-600">वास्तविक तौल दर्ज करें — J-Form और DBT स्वतः तैयार होगा</p>
      </header>
      <WeighmentPanel />
    </main>
  );
}