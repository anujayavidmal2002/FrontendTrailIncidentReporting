import React from "react";
import { FileText, ArrowLeft, CheckCircle } from "lucide-react";

export default function TrailPolicies({ onBack }) {
  const policies = [
    {
      title: "Environmental Protection",
      rules: [
        "Take all trash with you - leave no trace",
        "Stay on marked trails to prevent erosion",
        "Do not pick plants or disturb wildlife",
        "Use biodegradable soap and products",
      ],
    },
    {
      title: "Safety Guidelines",
      rules: [
        "Inform someone of your hiking plans",
        "Carry sufficient water and emergency supplies",
        "Check weather conditions before starting",
        "Hike in groups when possible",
      ],
    },
    {
      title: "Community Respect",
      rules: [
        "Respect local customs and traditions",
        "Support local businesses along the trail",
        "Ask permission before photographing people",
        "Keep noise levels down in residential areas",
      ],
    },
    {
      title: "Trail Etiquette",
      rules: [
        "Yield to uphill hikers on narrow paths",
        "Keep dogs on leash and clean up after them",
        "Camp only in designated areas",
        "Close all gates behind you",
      ],
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
            <FileText className="text-green-600" size={32} />
            <h1 className="text-3xl font-bold text-green-900">
              Trail Policies
            </h1>
          </div>

          <p className="text-gray-600 mb-8">
            Please follow these guidelines to ensure a safe, enjoyable, and
            sustainable experience for everyone on the Pekoe Trail.
          </p>

          <div className="space-y-6">
            {policies.map((section, index) => (
              <div
                key={index}
                className="border border-green-100 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle
                        className="text-green-600 flex-shrink-0 mt-0.5"
                        size={20}
                      />
                      <span className="text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Violations of these policies may
              result in fines or removal from the trail. Help us preserve this
              beautiful natural heritage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
