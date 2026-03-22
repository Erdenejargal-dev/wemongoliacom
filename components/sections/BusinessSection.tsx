import Link from "next/link";
import { Building2, Hotel, MapPin, Car, TrendingUp, Users, CheckCircle } from "lucide-react";

export default function BusinessSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            For Business Partners
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Grow Your Tourism Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join Mongolia&apos;s leading tourism platform and reach thousands of travelers looking for authentic experiences
          </p>
        </div>

        {/* Main CTA Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 md:p-12 mb-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                List Your Services Today
              </h3>
              <p className="text-blue-100 text-lg mb-6">
                Whether you own hotels, operate tours, or offer car rentals, We Mongolia connects you with travelers from around the world.
              </p>
              <Link
                href="/dashboard/business"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                <Building2 className="w-5 h-5" />
                Register Your Business
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <TrendingUp className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold mb-1">10K+</div>
                <div className="text-blue-100 text-sm">Monthly Visitors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Users className="w-8 h-8 mb-3" />
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-blue-100 text-sm">Travel Bookings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Hotel className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Hotels & Accommodations</h3>
            <p className="text-gray-600 mb-4">
              Showcase your property with detailed listings, room types, amenities, and real-time availability.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Multiple room types
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Pricing management
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Photo galleries
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <MapPin className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Tours & Experiences</h3>
            <p className="text-gray-600 mb-4">
              Create compelling tour packages with itineraries, schedules, and group pricing options.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Day-by-day itineraries
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Group bookings
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Date management
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Car className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Car Rentals</h3>
            <p className="text-gray-600 mb-4">
              List your vehicles with specifications, pricing, insurance options, and availability tracking.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Fleet management
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Insurance details
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Booking calendar
              </li>
            </ul>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why Partner With We Mongolia?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Increased Visibility</h4>
              <p className="text-sm text-gray-600">Reach travelers actively searching for Mongolia experiences</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Easy Management</h4>
              <p className="text-sm text-gray-600">Simple dashboard to manage all your listings in one place</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Direct Bookings</h4>
              <p className="text-sm text-gray-600">Connect directly with customers without intermediaries</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No Commission*</h4>
              <p className="text-sm text-gray-600">Keep 100% of your revenue during our launch period</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in to your dashboard
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
