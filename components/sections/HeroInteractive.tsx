"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Plane,
  Users,
  MapPin,
  Search,
  ChevronDown,
  Mountain,
  Tent,
  Hotel,
  Map,
  Compass,
  Camera,
  Shield,
  Clock,
  Award,
  Sparkles,
} from "lucide-react";

// Button configurations for each tab
const tabButtons = {
  destinations: [
    { id: "gobi", label: "Gobi Desert", icon: Mountain },
    { id: "ulaanbaatar", label: "Ulaanbaatar", icon: Map },
    { id: "nomadic", label: "Nomadic Life", icon: Tent },
  ],
  tours: [
    { id: "extreme", label: "Extreme Adventures", icon: Mountain },
    { id: "traditional", label: "Traditional Tours", icon: Users },
    { id: "luxury", label: "Luxury Travel", icon: Sparkles },
  ],
  hotels: [
    { id: "hotels", label: "City Hotels", icon: Hotel },
    { id: "ger", label: "Ger Camps", icon: Tent },
    { id: "luxury", label: "Luxury Stays", icon: Camera },
  ],
};

export default function HeroInteractive() {
  const [activeTab, setActiveTab] = useState<"destinations" | "tours" | "hotels">("tours");
  const [activeButton, setActiveButton] = useState("extreme");
  const [searchTab, setSearchTab] = useState("tours");

  // Update active button when tab changes
  const handleTabChange = (tab: "destinations" | "tours" | "hotels") => {
    setActiveTab(tab);
    setActiveButton(tabButtons[tab][0].id);
  };

  const currentButtons = tabButtons[activeTab];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
      </div>

      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=2000')",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24 md:pt-24 md:pb-28 lg:pt-28 lg:pb-32">
        {/* Announcement Badge */}
        <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-white text-center">
              Mongolia&apos;s #1 Travel Agency with Full Insurance
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-3 sm:mb-4">
            <span className="text-white">WE MON</span>
            <span className="text-green-400">GO</span>
            <span className="text-white">LIA</span>
          </h1>
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white/90 px-4">
            Your #1 Travel Consulting Service
          </div>
        </div>

    

        {/* Main Category Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8 px-2">
          <div className="inline-flex bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1 sm:p-1.5 shadow-xl w-full max-w-2xl">
            {[
              { id: "destinations", label: "Destinations", short: "Dest", icon: MapPin },
              { id: "tours", label: "Tours & Packages", short: "Tours", icon: Compass },
              { id: "hotels", label: "Accommodation", short: "Stay", icon: Hotel },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as "destinations" | "tours" | "hotels")}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 flex-1 px-2 sm:px-6 md:px-10 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="hidden sm:inline md:hidden">{tab.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic User Type Buttons */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-10 sm:mb-12 flex-wrap px-2">
          {currentButtons.map((btn) => {
            const IconComponent = btn.icon;
            return (
              <Button
                key={btn.id}
                onClick={() => setActiveButton(btn.id)}
                className={`px-3 py-2 sm:px-6 sm:py-3 rounded-full transition-all text-xs sm:text-sm font-semibold ${
                  activeButton === btn.id
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                    : "bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">{btn.label}</span>
                <span className="xs:hidden">{btn.label.split(' ')[0]}</span>
              </Button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:flex sm:justify-center gap-4 sm:gap-6 md:gap-12 mb-10 sm:mb-14 px-2">
          {[
            { icon: Award, value: "5,000+", label: "Happy Travelers" },
            { icon: Shield, value: "100%", label: "Insurance Coverage" },
            { icon: Clock, value: "24/7", label: "Support Available" },
            { icon: Sparkles, value: "50+", label: "Tour Packages" },
          ].map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className="text-center group">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <IconComponent className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Search Section */}
        <div className="max-w-5xl mx-auto">
          <div className="flex border-b border-white/20 mb-0 bg-white/5 backdrop-blur-sm rounded-t-2xl">
            {["Tours", "Destinations", "Ger Camps"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchTab(tab.toLowerCase().replace(" ", "-"))}
                className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 ${
                  searchTab === tab.toLowerCase().replace(" ", "-")
                    ? "border-green-400 text-white"
                    : "border-transparent text-white/60 hover:text-white/90"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="bg-white/95 backdrop-blur-lg rounded-b-2xl border border-white/20 p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Where in Mongolia?"
                  className="pl-11 h-14 border-gray-300 focus:border-green-500 focus:ring-green-500 text-base"
                />
              </div>
              <Select>
                <SelectTrigger className="h-14 border-gray-300 focus:border-green-500 focus:ring-green-500 text-base">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gobi">Gobi Desert</SelectItem>
                  <SelectItem value="khangai">Khangai Mountains</SelectItem>
                  <SelectItem value="khuvsgul">Lake Khuvsgul</SelectItem>
                  <SelectItem value="ulaanbaatar">Ulaanbaatar City</SelectItem>
                  <SelectItem value="altai">Altai Mountains</SelectItem>
                  <SelectItem value="steppe">Central Steppes</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-14 border-gray-300 focus:border-green-500 focus:ring-green-500 text-base">
                  <SelectValue placeholder="Experience Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extreme">Extreme Adventure</SelectItem>
                  <SelectItem value="nomadic">Nomadic Homestay</SelectItem>
                  <SelectItem value="cultural">Cultural Heritage</SelectItem>
                  <SelectItem value="wildlife">Wildlife Safari</SelectItem>
                  <SelectItem value="horseback">Horseback Riding</SelectItem>
                  <SelectItem value="luxury">Luxury Experience</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg">
                <Search className="w-5 h-5 mr-2" />
                Search Tours
              </Button>
            </div>
            
            {/* Quick Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Full Insurance Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>No Waiting • Instant Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span>Tailored to Your Needs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
