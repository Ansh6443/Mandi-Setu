import WeighmentPanel from "@/components/officer/WeighmentPanel";

export default function WeighmentPage() {
  return (
    <main className="min-h-full bg-[#f4f9f4] p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">तौल एवं भुगतान</h1>
        <p className="mt-1 text-sm font-bold text-gray-600">वास्तविक तौल दर्ज करें — J-Form और DBT स्वतः तैयार होगा</p>
      </header>
      <WeighmentPanel />
    </main>
  );
}