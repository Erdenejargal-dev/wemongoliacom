import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContent extends Document {
  section: 'hero' | 'about' | 'travel' | 'info';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    section: {
      type: String,
      required: true,
      enum: ['hero', 'about', 'travel', 'info'],
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: String,
    description: String,
    imageUrl: String,
    videoUrl: String,
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

export default Content;
