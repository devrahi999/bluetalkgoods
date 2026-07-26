"use client";

import { useState, useEffect } from "react";
import { Star, Send, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { getReviewsByProductId, addReviewToFirestore } from "@/lib/firestore";
import { AdminReview } from "@/types/admin";

interface ProductTabsProps {
  productId: string;
  productTitle: string;
  description: string;
  rating: number;
  reviewCount: number;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Anti-spam: track reviewed products in localStorage
function hasReviewedProduct(productId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const reviewed = JSON.parse(localStorage.getItem('_reviewed_products') || '[]') as string[];
    return reviewed.includes(productId);
  } catch { return false; }
}

function markProductReviewed(productId: string) {
  try {
    const reviewed = JSON.parse(localStorage.getItem('_reviewed_products') || '[]') as string[];
    if (!reviewed.includes(productId)) {
      reviewed.push(productId);
      localStorage.setItem('_reviewed_products', JSON.stringify(reviewed));
    }
  } catch {}
}

export function ProductTabs({ productId, productTitle, description, rating, reviewCount }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Review form state
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [starRating, setStarRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setAlreadyReviewed(hasReviewedProduct(productId));
  }, [productId]);

  useEffect(() => {
    if (activeTab === 'reviews' && reviews.length === 0) {
      setLoadingReviews(true);
      getReviewsByProductId(productId)
        .then(data => setReviews(data.sort((a, b) => b.createdAt - a.createdAt)))
        .catch(console.error)
        .finally(() => setLoadingReviews(false));
    }
  }, [activeTab, productId, reviews.length]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    if (alreadyReviewed) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await addReviewToFirestore({
        productId,
        productTitle,
        customerName: name.trim(),
        rating: starRating,
        comment: comment.trim(),
        isPublished: true, // auto-publish
        reply: '',
      });
      markProductReviewed(productId);
      setAlreadyReviewed(true);
      setSubmitted(true);
      setName('');
      setComment('');
      setStarRating(5);
    } catch {
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : rating;

  return (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm mt-8">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("description")}
          className={cn(
            "flex-1 py-4 text-center font-medium text-sm transition-colors",
            activeTab === "description"
              ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50/50"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "flex-1 py-4 text-center font-medium text-sm transition-colors",
            activeTab === "reviews"
              ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50/50"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          Reviews ({reviews.length > 0 ? reviews.length : reviewCount})
        </button>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "description" && (
          <div className="product-description">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-extrabold text-gray-900 mb-4 mt-6 first:mt-0 leading-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-gray-900 mb-3 mt-5 first:mt-0 leading-tight">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4 first:mt-0">{children}</h3>,
                h4: ({ children }) => <h4 className="text-base font-semibold text-gray-800 mb-2 mt-3 first:mt-0">{children}</h4>,
                p: ({ children }) => <p className="text-gray-700 mb-3 leading-relaxed text-sm md:text-base">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-4 text-gray-700 text-sm md:text-base">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 mb-4 text-gray-700 text-sm md:text-base">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-400 pl-4 py-1 my-4 bg-primary-50 rounded-r-md text-gray-700 italic">{children}</blockquote>
                ),
                code: ({ children }) => <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                hr: () => <hr className="my-6 border-gray-200" />,
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse text-sm">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="bg-gray-100 text-gray-900 font-semibold px-4 py-2 text-left border border-gray-200">{children}</th>,
                td: ({ children }) => <td className="px-4 py-2 border border-gray-200 text-gray-700">{children}</td>,
              }}
            >
              {description || "_No description available._"}
            </ReactMarkdown>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* Rating summary */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={cn("w-5 h-5", i <= Math.round(avgRating) ? "fill-current" : "text-gray-200")} />
                  ))}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Reviews list */}
            {loadingReviews ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm font-medium">No reviews yet — be the first!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{rev.customerName}</p>
                        <div className="flex text-yellow-400 mt-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={cn("w-3.5 h-3.5", i <= rev.rating ? "fill-current" : "text-gray-200")} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{formatDate(rev.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mt-2">{rev.comment}</p>
                    {rev.reply && (
                      <div className="mt-3 bg-primary-50 border-l-4 border-primary-400 rounded-r-md px-3 py-2">
                        <p className="text-xs font-bold text-primary-600 mb-0.5">Store Reply:</p>
                        <p className="text-xs text-gray-700">{rev.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Submit review form */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>

              {submitted ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Review submitted!</p>
                    <p className="text-xs text-green-600 mt-0.5">Your review is pending approval and will appear shortly.</p>
                  </div>
                </div>
              ) : alreadyReviewed ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-sm text-amber-700 font-medium">
                  You have already submitted a review for this product. Thank you!
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Star rating picker */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Your Rating *</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => setHoveredStar(i)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setStarRating(i)}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              "w-7 h-7 transition-colors",
                              i <= (hoveredStar || starRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                            )}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-semibold text-gray-600 self-center">
                        {['','Poor','Fair','Good','Very Good','Excellent'][hoveredStar || starRating]}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      maxLength={60}
                      placeholder="e.g. Rahim Uddin"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Your Review *</label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      required
                      maxLength={500}
                      rows={4}
                      placeholder="Share your experience with this product..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/500</p>
                  </div>

                  {submitError && (
                    <p className="text-sm text-red-500 font-medium">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !comment.trim()}
                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
