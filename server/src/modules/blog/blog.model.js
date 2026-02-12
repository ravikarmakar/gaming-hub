import mongoose from "mongoose";

// Blog Schema Definition
const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User collection
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizer", // Reference to Organizer collection (only if the author is an organizer)
    default: null, // Null if the user is a simple user
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  role: {
    type: String,
    enum: ["user", "organizer"], // Defines whether the blog is for a user or an organizer
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Blog model
const Blog = mongoose.model("Blog", BlogSchema);

export default Blog;
