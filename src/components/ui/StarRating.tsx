import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  className?: string;
  showText?: boolean;
  reviewCount?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  className,
  showText = false,
  reviewCount
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={size}
            className="fill-accent text-accent"
          />
        ))}
        
        {/* Half Star */}
        {hasHalfStar && (
          <div className="relative">
            <Star size={size} className="text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
              <Star size={size} className="fill-accent text-accent" />
            </div>
          </div>
        )}
        
        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={size}
            className="text-gray-300"
          />
        ))}
      </div>
      
      {showText && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)} 
          {reviewCount !== undefined && (
            <span className="text-gray-400 font-normal ml-1">
              ({reviewCount} reviews)
            </span>
          )}
        </span>
      )}
    </div>
  );
};
