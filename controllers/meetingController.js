
const Meeting = require('../models/Meeting');

const createMeeting = async (req, res) => {
  try {
    const meetingData = req.body;

    const meeting = new Meeting(meetingData);
    const savedMeeting = await meeting.save();

    res.status(201).json(savedMeeting);
  } catch (error) {
    res.status(500).json({ message: "Error creating meeting", error });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const deletedMeeting = await Meeting.findByIdAndDelete(meetingId);
    if (!deletedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: "Error deleting meeting", error });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const updatedData = req.body;

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      updatedData,
      { new: true }
    );

    if (!updatedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.status(200).json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: "Error updating meeting", error });
  }
};


module.exports = {createMeeting, deleteMeeting, updateMeeting}