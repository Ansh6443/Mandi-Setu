import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>पेज नहीं मिला</h1>
      <Link href="/">होम पेज पर जाएं</Link>
    </main>
  );
}
