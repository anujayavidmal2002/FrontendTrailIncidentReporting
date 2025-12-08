import React from "react";
import { Home, ArrowLeft, Star, MapPin } from "lucide-react";

export default function Accommodation({ onBack }) {
  const accommodations = [
    {
      name: "Tea Estate Bungalow",
      location: "Hanthana",
      type: "Guesthouse",
      price: "LKR 5,000/night",
      rating: 4.5,
      amenities: ["WiFi", "Hot Water", "Meals Included", "Mountain View"],
    },
    {
      name: "Highland Rest",
      location: "Loolkandura",
      type: "Hotel",
      price: "LKR 8,000/night",
      rating: 4.8,
      amenities: ["WiFi", "Restaurant", "Parking", "Guided Tours"],
    },
    {
      name: "Misty Hills Homestay",
      location: "Nuwara Eliya",
      type: "Homestay",
      price: "LKR 3,500/night",
      rating: 4.3,
      amenities: ["Family Friendly", "Home Cooked Meals", "Local Experience"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition text-green-800 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Home className="text-green-600" size={32} />
            <h1 className="text-3xl font-bold text-green-900">Accommodation</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Find comfortable places to stay along the Pekoe Trail. From cozy
            homestays to boutique hotels, rest well after your day's adventure.
          </p>

          <div className="space-y-6">
            {accommodations.map((place, index) => (
              <div
                key={index}
                className="border border-green-100 rounded-xl p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <MapPin size={16} />
                      <span className="text-sm">{place.location}</span>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {place.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star
                      className="text-yellow-500 fill-yellow-500"
                      size={18}
                    />
                    <span className="font-semibold text-gray-700">
                      {place.rating}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-green-700">
                    {place.price}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500 block mb-2">
                    Amenities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {place.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> This is a sample page. Contact details and
              booking information will be available in the full version.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
