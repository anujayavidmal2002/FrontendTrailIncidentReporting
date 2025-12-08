import React from "react";
import { MapPin, ArrowLeft } from "lucide-react";

export default function PekoeTrailStages({ onBack }) {
  const stages = [
    {
      stage: 1,
      name: "Kandy to Hanthana",
      distance: "26 km",
      difficulty: "Moderate",
      duration: "8-10 hours",
      highlights: "Tea estates, mountain views, colonial architecture",
    },
    {
      stage: 2,
      name: "Hanthana to Loolkandura",
      distance: "22 km",
      difficulty: "Challenging",
      duration: "7-9 hours",
      highlights: "Dense forests, waterfalls, wildlife",
    },
    {
      stage: 3,
      name: "Loolkandura to Nuwara Eliya",
      distance: "28 km",
      difficulty: "Moderate",
      duration: "9-11 hours",
      highlights: "Tea plantations, colonial town, Lake Gregory",
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
            <MapPin className="text-green-600" size={32} />
            <h1 className="text-3xl font-bold text-green-900">
              Smart Trail Stages
            </h1>
          </div>

          <p className="text-gray-600 mb-8">
            The Smart Trail stretches over 300 kilometers through Sri Lanka's
            stunning tea country. Explore the different stages of this
            magnificent journey.
          </p>

          <div className="space-y-4">
            {stages.map((stage) => (
              <div
                key={stage.stage}
                className="border border-green-100 rounded-xl p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                      Stage {stage.stage}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">
                      {stage.name}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stage.difficulty === "Challenging"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {stage.difficulty}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Distance</span>
                    <p className="font-semibold text-gray-700">
                      {stage.distance}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Duration</span>
                    <p className="font-semibold text-gray-700">
                      {stage.duration}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Highlights</span>
                  <p className="text-gray-700">{stage.highlights}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> This is a sample page. Full trail
              information with maps and detailed guides will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
