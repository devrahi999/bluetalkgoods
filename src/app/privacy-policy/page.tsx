export const metadata = {
  title: "Privacy Policy | BluaTalk Goods",
  description: "Privacy Policy for BluaTalk Goods.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-custom py-12 md:py-16 max-w-3xl mx-auto">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-7 md:p-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8 font-medium">Last updated: July 2025</p>
        
        <div className="space-y-7 text-gray-700 text-sm leading-relaxed">
          <p>At <strong className="text-gray-900">BluaTalk Goods</strong>, one of our main priorities is the privacy of our customers. This Privacy Policy outlines what information we collect and how we use it.</p>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Information We Collect</h2>
            <p>When you place an order, we collect:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li>Full name and phone number</li>
              <li>Delivery address and city</li>
              <li>WhatsApp number (for order confirmation)</li>
            </ul>
            <p className="mt-3">This information is used solely for order processing and delivery.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>To process and fulfill your orders</li>
              <li>To contact you regarding delivery status</li>
              <li>To send WhatsApp order confirmations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Data Security</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. Your data is used only for delivering your orders.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact Us</h2>
            <p>For any privacy-related questions, contact us via WhatsApp or through our <a href="/contact" className="text-primary-600 underline font-semibold">Contact page</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
