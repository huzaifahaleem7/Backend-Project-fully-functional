import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    video: {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      }
    },
    thumbnail: {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      }
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model("Video", videoSchema);
