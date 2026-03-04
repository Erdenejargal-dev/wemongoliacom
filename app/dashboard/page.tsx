"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, Shield } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Manage your account and bookings here.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* User Info Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profile Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">
                      {session.user?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {session.user?.role || "customer"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <p className="font-medium text-blue-900">My Bookings</p>
                  <p className="text-sm text-blue-600">
                    View your upcoming trips
                  </p>
                </button>
                <Link href="/dashboard/business" className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors block">
                  <p className="font-medium text-green-900">
                    Business Dashboard
                  </p>
                  <p className="text-sm text-green-600">
                    {session.user?.role === "business_owner" ? "Manage your listings" : "Register your business"}
                  </p>
                </Link>
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <p className="font-medium text-purple-900">
                    Account Settings
                  </p>
                  <p className="text-sm text-purple-600">
                    Update your profile
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              🚧 Phase 1 Complete - Authentication System Active!
            </h3>
            <p className="text-yellow-800 text-sm">
              The authentication system is now fully functional. Next phases
              will include business registration, booking system, payment
              integration, and more features. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
