import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
      <p className="text-gray-600 mb-8">
        Your payment was not completed. You can try again or contact us to book your trip manually.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/trekking" className="btn-primary">
          Browse Packages
        </Link>
        <Link href="/contact" className="border border-primary text-primary font-semibold px-8 py-3 rounded hover:bg-primary hover:text-white transition-colors">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
