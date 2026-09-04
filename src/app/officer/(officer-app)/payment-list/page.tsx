const payments = [
  ["#41", "विठ्ठल शिंदे", "MH-26032-1187", "₹91,000"],
  ["#42", "सुनीता जाधव", "MH-26032-2093", "₹19,602"],
  ["#43", "संतोष गायकवाड़", "MH-26032-3456", "₹1,62,855"],
  ["#44", "कावेरी देशमुख", "MH-26032-2761", "₹33,264"],
  ["#45", "रमेश पवार", "MH-26032-3390", "₹1,09,890"],
  ["#46", "अनिता भोसले", "MH-26032-4021", "₹74,324"],
  ["#47", "राम कुमार", "MH-26032-4812", "₹91,575"],
];

export default function PaymentListPage() {
  return (
    <main className="min-h-full bg-[#f4f9f4] p-6">
      <p className="mb-6 text-sm font-bold text-gray-600">वास्तविक तौल दर्ज करें — J-Form और DBT स्वतः तैयार होगा</p>
      <div className="mb-8 flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
        <h1 className="text-lg font-black text-gray-900">तौल शुरू करने के लिए प्रतीक्षारत किसान चुनें</h1>
        <p className="mt-3 text-base font-semibold text-gray-600">कोई किसान चेक-इन करके प्रतीक्षा नहीं कर रहा</p>
      </div>

      <h2 className="mb-4 text-lg font-black text-gray-900">आज की भुगतान सूची</h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500">
              <th className="px-4 py-4">टोकन</th>
              <th className="px-4 py-4">किसान</th>
              <th className="px-4 py-4">राशि</th>
              <th className="px-4 py-4">DBT स्टेटस</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(([token, name, id, amount]) => (
              <tr key={token} className="border-b border-gray-200 last:border-0">
                <td className="px-4 py-4 font-black text-gray-900">{token}</td>
                <td className="px-4 py-4"><strong className="block font-black text-gray-900">{name}</strong><span className="text-xs font-semibold text-gray-500">{id}</span></td>
                <td className="px-4 py-4 font-bold text-gray-900">{amount}</td>
                <td className="px-4 py-4"><span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />DBT सफल</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}