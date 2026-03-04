import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusiness extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: 'hotel' | 'tour_operator' | 'car_rental' | 'multiple';
  description?: string;
  logo?: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  website?: string;
  taxId?: string;
  licenseNumber?: string;
  isVerified: boolean;
  rating?: number;
  totalReviews?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    businessType: {
      type: String,
      enum: ['hotel', 'tour_operator', 'car_rental', 'multiple'],
      required: [true, 'Business type is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    contactInfo: {
      email: {
        type: String,
        required: [true, 'Contact email is required'],
      },
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      country: {
        type: String,
        default: 'Mongolia',
      },
    },
    website: {
      type: String,
    },
    taxId: {
      type: String,
    },
    licenseNumber: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
  }
);

BusinessSchema.index({ userId: 1 });
BusinessSchema.index({ businessType: 1 });
BusinessSchema.index({ isVerified: 1 });

const Business: Model<IBusiness> = mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);

export default Business;
