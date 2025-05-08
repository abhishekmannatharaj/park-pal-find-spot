
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from '@/context/AppContext';

export interface ReviewProps {
  spotId: string;
}

const Reviews: React.FC<ReviewProps> = ({ spotId }) => {
  const { getSpotReviews } = useApp();
  const reviews = getSpotReviews(spotId);
  
  if (reviews.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No reviews yet for this parking spot.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 p-3 rounded-md">
        <div className="flex items-center space-x-2">
          <div className="text-xl font-bold">{reviews.length > 0 ? 
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0}
          </div>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={`${
                  star <= (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {reviews.some(r => r.attributes.isRealImage) && (
            <Badge variant="secondary" className="text-xs">Real Images</Badge>
          )}
          {reviews.some(r => r.attributes.isSpaceAccurate) && (
            <Badge variant="secondary" className="text-xs">Accurate</Badge>
          )}
          {reviews.some(r => r.attributes.isSafeParking) && (
            <Badge variant="secondary" className="text-xs">Safe</Badge>
          )}
          {reviews.some(r => r.attributes.hasGoodLighting) && (
            <Badge variant="secondary" className="text-xs">Good Lighting</Badge>
          )}
        </div>
      </div>
      
      {/* Individual Reviews */}
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-3">
            <div className="flex justify-between items-start">
              <div className="font-medium">{review.userName}</div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={`${
                      star <= review.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              {new Date(review.date).toLocaleDateString()}
            </div>
            
            <p className="text-sm mt-2">{review.comment}</p>
            
            <div className="flex flex-wrap gap-1 mt-3">
              {review.attributes.isRealImage && (
                <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">Real Images</span>
              )}
              {review.attributes.isSpaceAccurate && (
                <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">Space as Described</span>
              )}
              {review.attributes.isOwnerResponsive && (
                <span className="bg-gray-100 text-xs px-2 py-1 rounded-full">Responsive Owner</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Reviews;
