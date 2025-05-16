export interface Token {
  id: string;
  userId?: string; // Optional as anonymous users might have tokens
  location: string;
  remainingViews: number;
  totalViews: number;
  purchaseDate: Date;
  expiryDate?: Date; // Optional expiry date
}

export interface TokenPurchase {
  location: string;
  viewCount: number;
}
