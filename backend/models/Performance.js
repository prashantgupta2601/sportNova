// backend/models/Performance.js
const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sport: { type: String, required: true },
  speed: { type: Number, required: true, min: 0, max: 100 },
  stamina: { type: Number, required: true, min: 0, max: 100 },
  strength: { type: Number, required: true, min: 0, max: 100 },

  //  video support
  videoUrl: { type: String, default: "" },   // YouTube / external url
  videoFile: { type: String, default: "" },  // uploaded file path

  createdAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
performanceSchema.index({ userId: 1, createdAt: -1 });
performanceSchema.index({ sport: 1 });

module.exports = mongoose.model("Performance", performanceSchema);
