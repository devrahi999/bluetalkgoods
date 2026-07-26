export const metadata = {
  title: "Terms & Conditions | BluaTalk Goods",
  description: "Terms & Conditions for BluaTalk Goods.",
};

export default function TermsPage() {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          <p>
            Welcome to BluaTalk Goods! By accessing this website, we assume you accept these terms and conditions. 
            Do not continue to use BluaTalk Goods if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Orders and Pricing</h2>
          <p>
            All orders placed are subject to product availability and acceptance. We reserve the right to refuse or cancel any order for any reason. 
            Prices for our products are subject to change without notice.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Payment</h2>
          <p>
            We currently operate exclusively on a Cash on Delivery (COD) model. Payment must be made in full to the delivery personnel upon receipt of the order.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Accuracy of Information</h2>
          <p>
            We attempt to be as accurate as possible when describing our products on the website; however, we do not warrant that the product descriptions, colors, information, or other content available on the website are accurate, complete, reliable, current, or error-free.
          </p>
        </div>
      </div>
    </div>
  );
}
