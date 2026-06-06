import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IClick extends Document {
  slug: string;
  country: string;
  browser: string;
  device: string;
  ipHash: string;
  createdAt: Date;
}

const ClickSchema = new Schema<IClick>(
  {
    slug: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Unknown',
    },
    ipHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false, // We only need createdAt for clicks
    },
  }
);

// Prevent redefining the model if hot reloading
const Click: Model<IClick> = mongoose.models.Click || mongoose.model<IClick>('Click', ClickSchema);

export default Click;
