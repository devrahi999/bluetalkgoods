export const metadata = {
  title: "Return Policy | BluaTalk Goods",
  description: "Return & Refund Policy for BluaTalk Goods.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="container-custom py-12 md:py-16 max-w-3xl mx-auto">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-7 md:p-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Return & Refund Policy</h1>
        <p className="text-sm text-gray-400 mb-8 font-medium">Last updated: July 2025</p>

        <div className="space-y-7 text-gray-700 text-sm leading-relaxed">
          <p>At <strong className="text-gray-900">BluaTalk Goods</strong>, customer satisfaction is our top priority. Please read our return policy carefully before placing an order.</p>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Return Eligibility</h2>
            <p>You may request a return within <strong className="text-gray-900">3 days</strong> of receiving your order if:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li>The product is defective or damaged upon arrival</li>
              <li>You received the wrong item</li>
              <li>The product does not match the description</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Non-Returnable Items</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Items returned after 3 days of delivery</li>
              <li>Used or damaged products (by the customer)</li>
              <li>Products without original packaging</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How to Request a Return</h2>
            <p>To request a return, please contact us via WhatsApp with:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li>Your Order ID (e.g. BTG-XXXXXXX)</li>
              <li>Photos/video of the defective product</li>
              <li>Your phone number used during order</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Refunds</h2>
            <p>Approved returns will receive a refund or replacement within <strong className="text-gray-900">5–7 business days</strong>. Since we use Cash on Delivery, refunds are processed via mobile banking (bKash/Nagad).</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact Us</h2>
            <p>For return requests, contact us via <a href="/contact" className="text-primary-600 underline font-semibold">our contact page</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
