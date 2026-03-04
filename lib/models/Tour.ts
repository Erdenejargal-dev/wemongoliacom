import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITour extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: 'cultural' | 'adventure' | 'nature' | 'historical' | 'nomadic' | 'multi-day';
  duration: {
    days: number;
    nights: number;
  };
  destination: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    activities: string[];
  }[];
  included: string[];
  excluded: string[];
  pricing: {
    adult: number;
    child?: number;
    group?: {
      minSize: number;
      pricePerPerson: number;
    };
  };
  images: string[];
  maxGroupSize: number;
  minGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'difficult';
  startDates: Date[];
  languages: string[];
  meetingPoint?: string;
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TourSchema = new Schema<ITour>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Tour name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['cultural', 'adventure', 'nature', 'historical', 'nomadic', 'multi-day'],
      required: [true, 'Category is required'],
    },
    duration: {
      days: {
        type: Number,
        required: true,
      },
      nights: {
        type: Number,
        required: true,
      },
    },
    destination: [{
      type: String,
      required: true,
    }],
    itinerary: [{
      day: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      activities: [String],
    }],
    included: [{
      type: String,
    }],
    excluded: [{
      type: String,
    }],
    pricing: {
      adult: {
        type: Number,
        required: true,
      },
      child: Number,
      group: {
        minSize: Number,
        pricePerPerson: Number,
      },
    },
    images: [{
      type: String,
    }],
    maxGroupSize: {
      type: Number,
      required: true,
    },
    minGroupSize: {
      type: Number,
      default: 1,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging', 'difficult'],
      default: 'moderate',
    },
    startDates: [{
      type: Date,
    }],
    languages: [{
      type: String,
    }],
    meetingPoint: String,
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

TourSchema.index({ businessId: 1 });
TourSchema.index({ category: 1 });
TourSchema.index({ duration: 1 });
TourSchema.index({ isActive: 1 });
TourSchema.index({ featured: 1 });

const Tour: Model<ITour> = mongoose.models.Tour || mongoose.model<ITour>('Tour', TourSchema);

export default Tour;
