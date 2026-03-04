import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDestination extends Document {
  name: string;
  description: string;
  imageUrl?: string;
  location?: string;
  category: 'nature' | 'culture' | 'adventure' | 'city';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema = new Schema<IDestination>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: String,
    location: String,
    category: {
      type: String,
      enum: ['nature', 'culture', 'adventure', 'city'],
      default: 'nature',
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

const Destination: Model<IDestination> = mongoose.models.Destination || mongoose.model<IDestination>('Destination', DestinationSchema);

export default Destination;
