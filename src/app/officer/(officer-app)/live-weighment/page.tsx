import LiveWeighmentPanel from "@/components/officer/LiveWeighmentPanel";

export default function LiveWeighmentPage() {
  return (
    <main className="min-h-full bg-[#f4f9f4] px-2 py-6 sm:px-4 lg:px-6">
      <header className="mb-7">
        <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black leading-tight text-gray-900">तौल एवं भुगतान</h1>
        <p className="mt-2 text-sm font-bold text-gray-600">वास्तविक तौल दर्ज करें — J-Form और DBT स्वतः तैयार होगा</p>
      </header>
      <LiveWeighmentPanel />
    </main>
  );
}