const mongoose = require("mongoose");
const { use } = require("../routes/auth");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    desc: {
      type: String,
      max: 600,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);    