
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from '@/context/AppContext';
import { toast } from "sonner";
import { Star } from "lucide-react";

interface FeedbackFormProps {
  bookingId: string;
  spotId: string;
  onSuccess: () => void;
}

const formSchema = z.object({
  rating: z.number().min(1, "Please provide a rating").max(5),
  comment: z.string().min(10, "Please provide at least 10 characters").max(500, "Comment should not exceed 500 characters"),
  isRealImage: z.boolean().optional(),
  isSpaceAccurate: z.boolean().optional(),
  isOwnerResponsive: z.boolean().optional(),
  isSafeParking: z.boolean().optional(),
  hasGoodLighting: z.boolean().optional(),
  isClean: z.boolean().optional(),
  isPaved: z.boolean().optional(),
});

type FeedbackFormValues = z.infer<typeof formSchema>;

const FeedbackForm: React.FC<FeedbackFormProps> = ({ bookingId, spotId, onSuccess }) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { submitReview } = useApp();
  
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      isRealImage: false,
      isSpaceAccurate: false,
      isOwnerResponsive: false,
      isSafeParking: false,
      hasGoodLighting: false,
      isClean: false,
      isPaved: false,
    },
  });
  
  const onSubmit = (data: FeedbackFormValues) => {
    submitReview({
      spotId,
      userId: '1',  // Assuming current user's ID
      userName: 'Current User', // Assuming current user's name
      rating: data.rating,
      comment: data.comment,
      attributes: {
        isRealImage: data.isRealImage || false,
        isSpaceAccurate: data.isSpaceAccurate || false,
        isOwnerResponsive: data.isOwnerResponsive || false,
        isSafeParking: data.isSafeParking || false,
        hasGoodLighting: data.hasGoodLighting || false,
        isClean: data.isClean || false,
        isPaved: data.isPaved || false,
      }
    });
    
    toast.success("Thank you! Your review has been submitted.");
    onSuccess();
  };

  const ratingValue = form.watch("rating");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => field.onChange(rating)}
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          (hoveredRating !== null ? rating <= hoveredRating : rating <= field.value)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share your experience with this parking spot..." 
                  className="resize-none h-24" 
                  {...field} 
                />
              </FormControl>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min 10 characters</span>
                <span>{field.value.length}/500</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isRealImage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Images were accurate
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isSpaceAccurate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Space was as described
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isOwnerResponsive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Owner was responsive
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isSafeParking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Safe parking area
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hasGoodLighting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Good lighting
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isClean"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Clean environment
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isPaved"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Paved/concrete surface
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full">Submit Review</Button>
      </form>
    </Form>
  );
};

export default FeedbackForm;
