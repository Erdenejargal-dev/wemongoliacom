import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICar extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: 'economy' | 'compact' | 'suv' | 'luxury' | 'van' | 'bus';
  make: string;
  carModel: string;
  year: number;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  seatingCapacity: number;
  luggage: number;
  features: string[];
  images: string[];
  pricing: {
    perDay: number;
    perWeek?: number;
    perMonth?: number;
  };
  insurance: {
    included: boolean;
    details?: string;
  };
  mileage: {
    unlimited: boolean;
    limit?: number;
    extraCharge?: number;
  };
  requirements: {
    minAge: number;
    licenseType: string;
    deposit: number;
  };
  location: {
    city: string;
    pickupPoints: string[];
  };
  availability: {
    available: boolean;
    bookedDates?: Date[];
  };
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CarSchema = new Schema<ICar>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['economy', 'compact', 'suv', 'luxury', 'van', 'bus'],
      required: [true, 'Category is required'],
    },
    make: {
      type: String,
      required: [true, 'Make is required'],
    },
    carModel: {
      type: String,
      required: [true, 'Car model is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual'],
      required: [true, 'Transmission type is required'],
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'hybrid', 'electric'],
      required: [true, 'Fuel type is required'],
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
    },
    luggage: {
      type: Number,
      default: 2,
    },
    features: [{
      type: String,
    }],
    images: [{
      type: String,
    }],
    pricing: {
      perDay: {
        type: Number,
        required: true,
      },
      perWeek: Number,
      perMonth: Number,
    },
    insurance: {
      included: {
        type: Boolean,
        default: false,
      },
      details: String,
    },
    mileage: {
      unlimited: {
        type: Boolean,
        default: false,
      },
      limit: Number,
      extraCharge: Number,
    },
    requirements: {
      minAge: {
        type: Number,
        default: 21,
      },
      licenseType: {
        type: String,
        default: 'Valid driver license',
      },
      deposit: {
        type: Number,
        required: true,
      },
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      pickupPoints: [{
        type: String,
      }],
    },
    availability: {
      available: {
        type: Boolean,
        default: true,
      },
      bookedDates: [{
        type: Date,
      }],
    },
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

CarSchema.index({ businessId: 1 });
CarSchema.index({ category: 1 });
CarSchema.index({ 'location.city': 1 });
CarSchema.index({ isActive: 1 });
CarSchema.index({ featured: 1 });

const Car: Model<ICar> = mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);

export default Car;
