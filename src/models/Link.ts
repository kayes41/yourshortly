import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILink extends Document {
  slug: string;
  targetUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    targetUrl: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent redefining the model if hot reloading
const Link: Model<ILink> = mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);

export default Link;
