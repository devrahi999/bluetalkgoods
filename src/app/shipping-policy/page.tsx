export const metadata = {
  title: "Shipping Policy | BluaTalk Goods",
  description: "Shipping Information for BluaTalk Goods.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Shipping Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          <p>
            We strive to deliver your orders as quickly and efficiently as possible across Bangladesh.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Delivery Time</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Inside Dhaka:</strong> Delivery within 24-48 hours from the time of order confirmation.</li>
            <li><strong>Outside Dhaka:</strong> Delivery within 3-5 working days from the time of order confirmation.</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Delivery Charges</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Inside Dhaka:</strong> ৳60</li>
            <li><strong>Outside Dhaka:</strong> ৳120</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Order Tracking</h2>
          <p>
            Once your order is dispatched, you will receive an SMS with tracking details. You can also track your order status directly on our website using your Order ID and Phone Number on the <a href="/order-tracking" className="text-primary-600 hover:underline">Track Order</a> page.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Cash on Delivery (COD)</h2>
          <p>
            We currently only support Cash on Delivery. Please keep the exact amount ready to avoid inconvenience. For orders outside Dhaka, we might require an advance payment of the delivery charge (৳120) to confirm the order.
          </p>
        </div>
      </div>
    </div>
  );
}
