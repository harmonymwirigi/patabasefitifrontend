import React, { createContext, useContext, useState, useEffect } from "react";
import { Token, TokenPurchase } from "@/types/token";

interface TokenContextType {
  tokens: Token[];
  currentToken: Token | null;
  purchaseToken: (
    purchase: TokenPurchase & { contactEmail: string },
  ) => Promise<Token>;
  useToken: (location: string, propertyId: string) => boolean;
  hasValidToken: (location: string) => boolean;
  getRemainingViews: (location: string) => number;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const useTokenContext = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }
  return context;
};

interface TokenProviderProps {
  children: React.ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentToken, setCurrentToken] = useState<Token | null>(null);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const savedTokens = localStorage.getItem("patabasefiti_tokens");
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        // Convert string dates back to Date objects
        const processedTokens = parsedTokens.map((token: any) => ({
          ...token,
          purchaseDate: new Date(token.purchaseDate),
          expiryDate: token.expiryDate ? new Date(token.expiryDate) : undefined,
        }));
        setTokens(processedTokens);
      } catch (error) {
        console.error("Failed to parse saved tokens:", error);
      }
    }
  }, []);

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("patabasefiti_tokens", JSON.stringify(tokens));
  }, [tokens]);

  // Generate a unique token ID
  const generateTokenId = () => {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Purchase a new token
  const purchaseToken = async (
    purchase: TokenPurchase & { contactEmail: string },
  ): Promise<Token> => {
    // In a real app, this would make an API call to process payment and generate a token
    // For now, we'll simulate the process

    // Create expiry date (30 days from now)
    const purchaseDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const newToken: Token = {
      id: generateTokenId(),
      location: purchase.location,
      remainingViews: purchase.viewCount,
      totalViews: purchase.viewCount,
      purchaseDate,
      expiryDate,
      // In a real app, we might associate with a user ID if they're logged in
    };

    // Add the new token to the state
    setTokens((prevTokens) => [...prevTokens, newToken]);
    setCurrentToken(newToken);

    return newToken;
  };

  // Check if a token is valid for a specific location
  const hasValidToken = (location: string): boolean => {
    const now = new Date();
    return tokens.some(
      (token) =>
        token.location === location &&
        token.remainingViews > 0 &&
        (!token.expiryDate || token.expiryDate > now),
    );
  };

  // Get remaining views for a location
  const getRemainingViews = (location: string): number => {
    const now = new Date();
    const validTokens = tokens.filter(
      (token) =>
        token.location === location &&
        (!token.expiryDate || token.expiryDate > now),
    );

    if (validTokens.length === 0) return 0;

    // Sum up remaining views across all valid tokens for this location
    return validTokens.reduce(
      (total, token) => total + token.remainingViews,
      0,
    );
  };

  // Use a token to view a property
  const useToken = (location: string, propertyId: string): boolean => {
    const now = new Date();

    // Find a valid token for this location
    const tokenIndex = tokens.findIndex(
      (token) =>
        token.location === location &&
        token.remainingViews > 0 &&
        (!token.expiryDate || token.expiryDate > now),
    );

    if (tokenIndex === -1) return false;

    // Update the token's remaining views
    setTokens((prevTokens) => {
      const updatedTokens = [...prevTokens];
      updatedTokens[tokenIndex] = {
        ...updatedTokens[tokenIndex],
        remainingViews: updatedTokens[tokenIndex].remainingViews - 1,
      };
      return updatedTokens;
    });

    return true;
  };

  const value = {
    tokens,
    currentToken,
    purchaseToken,
    useToken,
    hasValidToken,
    getRemainingViews,
  };

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};
