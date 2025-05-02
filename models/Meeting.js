import mongoose from "mongoose"


const MeetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    duration: { type: Number }, 
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, 
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, 
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'canceled'],
      default: 'scheduled',
    },
    location: { type: String },
    createdAt: { type: Date, default: Date.now },
  });


export default mongoose.model("Meeting", MeetingSchema)