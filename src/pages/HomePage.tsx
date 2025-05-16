import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import PropertySearchFilters from "@/components/property/PropertySearchFilters";
import FeaturedListings from "@/components/property/FeaturedListings";
import PropertyCard from "@/components/property/PropertyCard";
import AuthModal from "@/components/auth/AuthModal";
import TokenPurchaseModal from "@/components/token/TokenPurchaseModal";
import Footer from "@/components/layout/Footer";
import { useTokenContext } from "@/context/TokenContext";

const HomePage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">(
    "login",
  );
  const [currentLocation, setCurrentLocation] = useState("");
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false);

  // Token context
  const { hasValidToken, purchaseToken, getRemainingViews, useToken } =
    useTokenContext();

  // Mock user state - in a real app, this would come from auth context/state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"tenant" | "owner" | "admin">(
    "tenant",
  );

  const handleLoginClick = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthModalTab("register");
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleCloseTokenModal = () => {
    setIsTokenModalOpen(false);
  };

  const handleTokenPurchase = async (purchase: any) => {
    try {
      const token = await purchaseToken(purchase);
      console.log("Token purchased:", token);

      // If we were trying to filter properties, retry the filter operation
      if (currentLocation) {
        const mockFilteredProperties = mockFilterProperties({
          location: currentLocation,
          priceRange: [5000, 50000],
          bedrooms: 1,
          bathrooms: 1,
          amenities: {
            parking: false,
            wifi: false,
            security: false,
            furnished: false,
          },
          safetyScore: 3,
        });
        setFilteredProperties(mockFilteredProperties);
        setHasAppliedFilter(true);
      }

      // Show success message
      alert(
        `Successfully purchased ${token.totalViews} views for ${token.location}!`,
      );
    } catch (error) {
      console.error("Error purchasing token:", error);
    }
  };

  const handlePropertySearch = (filters: any) => {
    console.log("Search filters applied:", filters);
    setCurrentLocation(filters.location);

    // Check if user has a valid token for this location
    if (hasValidToken(filters.location)) {
      // User has a valid token, filter properties
      const mockFilteredProperties = mockFilterProperties(filters);
      setFilteredProperties(mockFilteredProperties);
      setHasAppliedFilter(true);
    } else {
      // User doesn't have a valid token, prompt to purchase
      setIsTokenModalOpen(true);
    }
  };

  // Mock function to filter properties based on filters
  const mockFilterProperties = (filters: any) => {
    // This would be replaced with an actual API call in a real app
    // For now, we'll just filter the mock data from FeaturedListings
    const allProperties = [
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
      {
        id: "7",
        title: "Spacious Apartment in Roysambo",
        price: 25000,
        location: "Roysambo, Nairobi",
        bedrooms: 2,
        bathrooms: 1,
        area: 750,
        safetyScore: 3.8,
        amenities: ["Parking", "Water Tank", "Security"],
        imageUrl:
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=80",
        isFeatured: true,
      },
      {
        id: "8",
        title: "Budget Studio in Roysambo",
        price: 15000,
        location: "Roysambo, Nairobi",
        bedrooms: 1,
        bathrooms: 1,
        area: 350,
        safetyScore: 3.5,
        amenities: ["Water Tank", "Security"],
        imageUrl:
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&q=80",
        isFeatured: false,
      },
      {
        id: "9",
        title: "Family House in Roysambo",
        price: 35000,
        location: "Roysambo, Nairobi",
        bedrooms: 3,
        bathrooms: 2,
        area: 1000,
        safetyScore: 4.0,
        amenities: ["Parking", "Garden", "Security"],
        imageUrl:
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80",
        isFeatured: true,
      },
    ];

    // Filter by location
    let filtered = allProperties;
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter((property) =>
        property.location.toLowerCase().includes(locationLower),
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (property) =>
        property.price >= filters.priceRange[0] &&
        property.price <= filters.priceRange[1],
    );

    // Filter by bedrooms and bathrooms
    filtered = filtered.filter(
      (property) =>
        property.bedrooms >= filters.bedrooms &&
        property.bathrooms >= filters.bathrooms,
    );

    // Filter by safety score
    filtered = filtered.filter(
      (property) => property.safetyScore >= filters.safetyScore,
    );

    // Filter by amenities
    if (Object.values(filters.amenities).some((value) => value === true)) {
      filtered = filtered.filter((property) => {
        const propertyAmenities = property.amenities.map((a) =>
          a.toLowerCase(),
        );
        if (filters.amenities.parking && !propertyAmenities.includes("parking"))
          return false;
        if (filters.amenities.wifi && !propertyAmenities.includes("wifi"))
          return false;
        if (
          filters.amenities.security &&
          !propertyAmenities.includes("security")
        )
          return false;
        if (
          filters.amenities.furnished &&
          !propertyAmenities.includes("furnished")
        )
          return false;
        return true;
      });
    }

    return filtered;
  };

  const handleQuickView = (propertyId: string) => {
    console.log("Quick view property:", propertyId);

    // If we have a current location and a valid token, use a token view
    if (currentLocation && hasValidToken(currentLocation)) {
      // Use a token to view this property
      const success = useToken(currentLocation, propertyId);
      if (success) {
        console.log(
          `Used a token for ${currentLocation} to view property ${propertyId}`,
        );
        // In a real app, this would open a property quick view modal
        alert(
          `Property details viewed! You have ${getRemainingViews(currentLocation)} views remaining for ${currentLocation}.`,
        );
      } else {
        console.log(`Failed to use token for ${currentLocation}`);
        // This shouldn't happen if hasValidToken returned true, but just in case
        setIsTokenModalOpen(true);
      }
    } else {
      // No valid token, prompt to purchase
      setCurrentLocation("Roysambo"); // Default location if none selected
      setIsTokenModalOpen(true);
    }
  };

  const handleSaveProperty = (propertyId: string) => {
    console.log("Save property:", propertyId);
    // In a real app, this would save the property to user's favorites
    // If user is not logged in, it would prompt login
    if (!isLoggedIn) {
      handleLoginClick();
    }
  };

  const handleHeroCtaClick = () => {
    // Scroll to property search section
    const searchSection = document.getElementById("property-search");
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <Navbar
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />

      {/* Hero Section */}
      <HeroSection onCtaClick={handleHeroCtaClick} />

      {/* Property Search Section */}
      <section id="property-search" className="py-8 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Find Your Perfect Property
          </h2>
          <PropertySearchFilters onFilterApply={handlePropertySearch} />
        </div>
      </section>

      {/* Property Listings Section */}
      {hasAppliedFilter ? (
        <section className="py-12 px-4 md:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Search Results</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {filteredProperties.length > 0
                  ? `Found ${filteredProperties.length} properties matching your criteria`
                  : "No properties found matching your criteria"}
              </p>
              {currentLocation && (
                <p className="text-sm font-medium mt-2 text-primary">
                  You have {getRemainingViews(currentLocation)} views remaining
                  for {currentLocation}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredProperties.map((property) => (
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
                    onQuickView={handleQuickView}
                    onSave={handleSaveProperty}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <FeaturedListings
          onQuickView={handleQuickView}
          onSave={handleSaveProperty}
        />
      )}

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Why Choose PataBaseFiti
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Verified Properties
              </h3>
              <p className="text-gray-600">
                All our listings are verified for authenticity and accurate
                information to ensure you make informed decisions.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">M-Pesa Integration</h3>
              <p className="text-gray-600">
                Seamless payment processing through M-Pesa for rent, deposits,
                and other property-related transactions.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Neighborhood Insights
              </h3>
              <p className="text-gray-600">
                Detailed information about neighborhoods including safety
                scores, amenities, and proximity to essential services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            What Our Users Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
                  alt="John Doe"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">John Doe</h4>
                  <p className="text-sm text-gray-500">Tenant</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "PataBaseFiti made finding my apartment in Nairobi so easy. The
                neighborhood safety scores were particularly helpful as I was
                new to the city."
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=jane"
                  alt="Jane Smith"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Jane Smith</h4>
                  <p className="text-sm text-gray-500">Property Owner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "As a property owner, I've been able to find reliable tenants
                quickly. The M-Pesa integration makes rent collection
                hassle-free."
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=michael"
                  alt="Michael Wanjau"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Michael Wanjau</h4>
                  <p className="text-sm text-gray-500">Tenant</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The detailed property listings with virtual tours saved me so
                much time. I found my dream apartment without having to
                physically visit dozens of places."
              </p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 md:px-8 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of satisfied users who have found their ideal
            properties through PataBaseFiti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRegisterClick}
              className="bg-white text-primary font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                const searchSection =
                  document.getElementById("property-search");
                if (searchSection) {
                  searchSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        defaultTab={authModalTab}
      />

      {/* Token Purchase Modal */}
      <TokenPurchaseModal
        isOpen={isTokenModalOpen}
        onClose={handleCloseTokenModal}
        onPurchase={handleTokenPurchase}
        locations={[
          "Roysambo",
          "Westlands",
          "Kilimani",
          "Karen",
          "Lavington",
          "CBD",
        ]}
      />
    </div>
  );
};

export default HomePage;
