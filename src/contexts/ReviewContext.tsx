import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Review {
  id: string;
  buyerName: string;
  rating: number;
  comment: string;
  date: string;
  sellerId: string;
  cropName?: string;
}

interface ReviewContextType {
  getReviewsForSeller: (sellerId: string) => Review[];
  addReview: (review: Review) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const getReviewsForSeller = (sellerId: string) =>
    reviews.filter((r) => r.sellerId === sellerId);

  const addReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  return (
    <ReviewContext.Provider value={{ getReviewsForSeller, addReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewProvider");
  return ctx;
}
