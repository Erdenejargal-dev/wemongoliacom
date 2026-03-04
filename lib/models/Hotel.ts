import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHotel extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: 'luxury' | 'boutique' | 'budget' | 'hostel' | 'resort';
  location: {
    address: string;
    city: string;
    region: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  rooms: {
    type: string;
    description?: string;
    capacity: number;
    pricePerNight: number;
    available: number;
  }[];
  rating?: number;
  totalReviews?: number;
  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
  };
  isActive: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HotelSchema = new Schema<IHotel>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['luxury', 'boutique', 'budget', 'hostel', 'resort'],
      required: [true, 'Category is required'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      region: {
        type: String,
        required: [true, 'Region is required'],
      },
      country: {
        type: String,
        default: 'Mongolia',
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    amenities: [{
      type: String,
    }],
    images: [{
      type: String,
    }],
    rooms: [{
      type: {
        type: String,
        required: true,
      },
      description: String,
      capacity: {
        type: Number,
        required: true,
      },
      pricePerNight: {
        type: Number,
        required: true,
      },
      available: {
        type: Number,
        required: true,
      },
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    policies: {
      checkIn: String,
      checkOut: String,
      cancellation: String,
    },
    contactInfo: {
      email: String,
      phone: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

HotelSchema.index({ businessId: 1 });
HotelSchema.index({ 'location.city': 1 });
HotelSchema.index({ category: 1 });
HotelSchema.index({ isActive: 1 });
HotelSchema.index({ featured: 1 });

const Hotel: Model<IHotel> = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', HotelSchema);

export default Hotel;
