"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Hotel, MapPin, Car, Plus, Edit, Trash2 } from "lucide-react";

export default function BusinessDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchBusinessData();
    }
  }, [status, router]);

  const fetchBusinessData = async () => {
    try {
      // Fetch business info
      const businessRes = await fetch("/api/business");
      if (businessRes.ok) {
        const businessData = await businessRes.json();
        setBusiness(businessData);

        // Fetch hotels, tours, and cars for this business
        const [hotelsRes, toursRes, carsRes] = await Promise.all([
          fetch(`/api/hotels?businessId=${businessData._id}`),
          fetch(`/api/tours?businessId=${businessData._id}`),
          fetch(`/api/cars?businessId=${businessData._id}`)
        ]);

        if (hotelsRes.ok) setHotels(await hotelsRes.json());
        if (toursRes.ok) setTours(await toursRes.json());
        if (carsRes.ok) setCars(await carsRes.json());
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              No Business Profile Found
            </h1>
            <p className="text-gray-600 mb-6">
              Register your business to start listing hotels, tours, and cars.
            </p>
            <Link
              href="/dashboard/business/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Register Your Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {business.businessName}
              </h1>
              <p className="text-gray-600 mb-2">{business.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="capitalize">{business.businessType.replace('_', ' ')}</span>
                <span>•</span>
                <span>{business.contactInfo.city}, {business.contactInfo.country}</span>
                {business.isVerified && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">✓ Verified</span>
                  </>
                )}
              </div>
            </div>
            <Link
              href="/dashboard/business/edit"
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Edit Business
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Hotel className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Hotels</p>
                <p className="text-2xl font-bold text-gray-900">{hotels.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Tours</p>
                <p className="text-2xl font-bold text-gray-900">{tours.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Car className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Cars</p>
                <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            href="/dashboard/business/hotels/new"
            className="bg-blue-50 hover:bg-blue-100 rounded-lg p-6 transition-colors"
          >
            <Plus className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-blue-900 mb-1">Add Hotel</h3>
            <p className="text-sm text-blue-600">List a new hotel property</p>
          </Link>
          <Link
            href="/dashboard/business/tours/new"
            className="bg-green-50 hover:bg-green-100 rounded-lg p-6 transition-colors"
          >
            <Plus className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-green-900 mb-1">Add Tour</h3>
            <p className="text-sm text-green-600">Create a new tour package</p>
          </Link>
          <Link
            href="/dashboard/business/cars/new"
            className="bg-purple-50 hover:bg-purple-100 rounded-lg p-6 transition-colors"
          >
            <Plus className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-purple-900 mb-1">Add Car</h3>
            <p className="text-sm text-purple-600">List a car for rental</p>
          </Link>
        </div>

        {/* Listings Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Listings</h2>
          
          {/* Hotels */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Hotel className="w-5 h-5" />
              Hotels ({hotels.length})
            </h3>
            {hotels.length === 0 ? (
              <p className="text-gray-500 text-sm">No hotels listed yet.</p>
            ) : (
              <div className="space-y-3">
                {hotels.map((hotel) => (
                  <div key={hotel._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                      <p className="text-sm text-gray-500">{hotel.location.city} • {hotel.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/business/hotels/${hotel._id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tours */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Tours ({tours.length})
            </h3>
            {tours.length === 0 ? (
              <p className="text-gray-500 text-sm">No tours listed yet.</p>
            ) : (
              <div className="space-y-3">
                {tours.map((tour) => (
                  <div key={tour._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{tour.name}</h4>
                      <p className="text-sm text-gray-500">{tour.duration.days} days • {tour.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/business/tours/${tour._id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cars */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Cars ({cars.length})
            </h3>
            {cars.length === 0 ? (
              <p className="text-gray-500 text-sm">No cars listed yet.</p>
            ) : (
              <div className="space-y-3">
                {cars.map((car) => (
                  <div key={car._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{car.name}</h4>
                      <p className="text-sm text-gray-500">{car.make} {car.carModel} • {car.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/business/cars/${car._id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
