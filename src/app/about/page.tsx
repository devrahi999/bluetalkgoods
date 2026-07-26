export const metadata = {
  title: "About Us | BluaTalk Goods",
  description: "Learn more about BluaTalk Goods and our mission.",
};

export default function AboutPage() {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Us</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          <p>
            Welcome to <strong>BluaTalk Goods</strong>, your premier destination for high-quality products in Bangladesh. 
            We are dedicated to giving you the very best of everyday essentials, with a focus on quality, customer service, and uniqueness.
          </p>
          
          <p>
            Founded with a vision to provide a seamless online shopping experience, BluaTalk Goods has come a long way from its beginnings. 
            When we first started out, our passion for curating premium items drove us to do intense research so that BluaTalk Goods can offer you the most reliable products.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p>
            Our mission is to simplify your shopping experience while maintaining the highest standards of product quality. 
            We believe that everyone deserves access to premium goods without the hassle of complicated checkout processes. 
            That's why we offer a straightforward <strong>Cash on Delivery</strong> system across Bangladesh.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Premium Quality:</strong> Every product in our store is carefully selected and vetted.</li>
            <li><strong>Cash on Delivery:</strong> Pay only when you receive your product in hand.</li>
            <li><strong>Fast Shipping:</strong> We strive to deliver your orders as quickly as possible.</li>
            <li><strong>Customer Support:</strong> We are always here to help you with any questions or concerns.</li>
          </ul>
          
          <p className="mt-8">
            We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, 
            please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  );
}
