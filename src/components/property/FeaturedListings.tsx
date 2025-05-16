import React, { useState } from "react";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  safetyScore: number;
  amenities: string[];
  imageUrl: string;
  isFeatured: boolean;
}

interface FeaturedListingsProps {
  title?: string;
  subtitle?: string;
  properties?: Property[];
  onQuickView?: (id: string) => void;
  onSave?: (id: string) => void;
}

const FeaturedListings = ({
  title = "Featured Properties",
  subtitle = "Discover our handpicked selection of premium properties across Kenya",
  properties = [
    {
      id: "1",
      title: "Modern Apartment in Westlands",
      price: 45000,
      location: "Westlands, Nairobi",
      bedrooms: 2,
      bathrooms: 1,
      area: 850,
      safetyScore: 4.5,
      amenities: ["Parking", "Security", "Water Tank"],
      imageUrl:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80",
      isFeatured: true,
    },
    {
      id: "2",
      title: "Luxury Villa in Karen",
      price: 120000,
      location: "Karen, Nairobi",
      bedrooms: 4,
      bathrooms: 3,
      area: 2500,
      safetyScore: 4.8,
      amenities: ["Swimming Pool", "Garden", "Security"],
      imageUrl:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80",
      isFeatured: true,
    },
    {
      id: "3",
      title: "Cozy Studio in Kilimani",
      price: 30000,
      location: "Kilimani, Nairobi",
      bedrooms: 1,
      bathrooms: 1,
      area: 450,
      safetyScore: 4.2,
      amenities: ["Furnished", "WiFi", "Gym"],
      imageUrl:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80",
      isFeatured: false,
    },
    {
      id: "4",
      title: "Beachfront Apartment in Mombasa",
      price: 65000,
      location: "Nyali, Mombasa",
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      safetyScore: 4.6,
      amenities: ["Ocean View", "Air Conditioning", "Parking"],
      imageUrl:
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=500&q=80",
      isFeatured: true,
    },
    {
      id: "5",
      title: "Family Home in Lavington",
      price: 85000,
      location: "Lavington, Nairobi",
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      safetyScore: 4.7,
      amenities: ["Garden", "Servant Quarter", "Security"],
      imageUrl:
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=500&q=80",
      isFeatured: false,
    },
    {
      id: "6",
      title: "Modern Office Space in CBD",
      price: 75000,
      location: "CBD, Nairobi",
      bedrooms: 0,
      bathrooms: 2,
      area: 1500,
      safetyScore: 4.3,
      amenities: ["Reception", "Conference Room", "Parking"],
      imageUrl:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500&q=80",
      isFeatured: false,
    },
  ],
  onQuickView = () => {},
  onSave = () => {},
}: FeaturedListingsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 3;
  const totalPages = Math.ceil(properties.length / propertiesPerPage);

  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = properties.slice(
    indexOfFirstProperty,
    indexOfLastProperty,
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full py-12 px-4 md:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentProperties.map((property) => (
            <div key={property.id} className="flex justify-center">
              <PropertyCard
                id={property.id}
                title={property.title}
                price={property.price}
                location={property.location}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                safetyScore={property.safetyScore}
                amenities={property.amenities}
                imageUrl={property.imageUrl}
                isFeatured={property.isFeatured}
                onQuickView={onQuickView}
                onSave={onSave}
              />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={cn(
                "rounded-full",
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "",
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={cn(
                "rounded-full",
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "",
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedListings;
