import React from "react";
import { Building2, ArrowLeft, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function Organization({ onBack }) {
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
            <Building2 className="text-green-600" size={32} />
            <h1 className="text-3xl font-bold text-green-900">
              The Pekoe Trail Organization
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 mb-4">
              The Pekoe Trail is Sri Lanka's first long-distance hiking trail,
              stretching over 300 kilometers through the heart of the country's
              stunning tea country. Our organization is dedicated to developing
              and maintaining this trail while supporting local communities and
              preserving the natural environment.
            </p>
            <p className="text-gray-600">
              We work closely with tea estate workers, local businesses, and
              conservation groups to create a sustainable tourism model that
              benefits everyone while protecting this unique landscape for
              future generations.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              What We Do
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-green-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-2">
                  Trail Development
                </h3>
                <p className="text-sm text-gray-600">
                  Creating and maintaining safe, well-marked paths with proper
                  infrastructure
                </p>
              </div>
              <div className="border border-green-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-2">
                  Community Empowerment
                </h3>
                <p className="text-sm text-gray-600">
                  Supporting local communities through sustainable tourism
                  opportunities
                </p>
              </div>
              <div className="border border-green-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-2">Conservation</h3>
                <p className="text-sm text-gray-600">
                  Protecting biodiversity and promoting responsible
                  environmental practices
                </p>
              </div>
              <div className="border border-green-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-2">
                  Cultural Heritage
                </h3>
                <p className="text-sm text-gray-600">
                  Preserving and sharing the rich history and culture of Sri
                  Lanka's tea country
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Contact Us
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="text-green-600" size={20} />
                <span>info@pekoetrail.org</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="text-green-600" size={20} />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="text-green-600" size={20} />
                <span>Kandy, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Globe className="text-green-600" size={20} />
                <span>www.pekoetrail.org</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> This is a sample page with placeholder
              information. Visit our official website for complete details about
              the organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
