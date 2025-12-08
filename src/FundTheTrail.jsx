import React, { useState } from "react";
import { DollarSign, ArrowLeft, Heart, Users, TreePine } from "lucide-react";

export default function FundTheTrail({ onBack }) {
  const [selectedAmount, setSelectedAmount] = useState(null);

  const impactAreas = [
    {
      icon: TreePine,
      title: "Trail Maintenance",
      description: "Keep the paths clear, safe, and well-marked for all hikers",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Support local communities and create sustainable employment",
    },
    {
      icon: Heart,
      title: "Conservation",
      description: "Protect the natural environment and preserve biodiversity",
    },
  ];

  const donationAmounts = [1000, 2500, 5000, 10000];

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
            <DollarSign className="text-green-600" size={32} />
            <h1 className="text-3xl font-bold text-green-900">
              Fund the Trail
            </h1>
          </div>

          <p className="text-gray-600 mb-8">
            Your contribution helps maintain and improve the Smart Trail,
            supports local communities, and protects this unique natural and
            cultural heritage.
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Your Impact
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {impactAreas.map((area, index) => (
                <div
                  key={index}
                  className="border border-green-100 rounded-xl p-4 text-center hover:shadow-md transition"
                >
                  <area.icon
                    className="mx-auto text-green-600 mb-3"
                    size={32}
                  />
                  <h3 className="font-bold text-gray-800 mb-2">{area.title}</h3>
                  <p className="text-sm text-gray-600">{area.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Choose Amount
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {donationAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`p-4 rounded-xl border-2 font-bold transition ${
                    selectedAmount === amount
                      ? "border-green-600 bg-green-50 text-green-800"
                      : "border-gray-200 hover:border-green-300 text-gray-700"
                  }`}
                >
                  LKR {amount.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="number"
                placeholder="Custom amount (LKR)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <button
            disabled={!selectedAmount}
            className={`w-full py-3 rounded-lg font-bold transition ${
              selectedAmount
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Proceed to Payment
          </button>

          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> This is a sample page. Payment integration
              will be added in the full version. All donations will be
              transparently used for trail development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
