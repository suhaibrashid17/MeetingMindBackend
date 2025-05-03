import mongoose from 'mongoose';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import fs from 'fs';
import Groq from 'groq-sdk';

export const createMeeting = async (req, res) => {
  try {
    const { attendees, date, description, duration, title, venue, organizerId } = req.body;
    console.log(req.body);
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ error: 'Invalid organizer ID' });
    }
    const organizer = await User.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }
    let validAttendees = [];
    if (attendees && Array.isArray(attendees)) {
      const invalidAttendees = attendees.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidAttendees.length > 0) {
        return res.status(400).json({ error: 'Invalid attendee IDs' });
      }
      validAttendees = await User.find({ _id: { $in: attendees } });
      if (validAttendees.length !== attendees.length) {
        return res.status(404).json({ error: 'One or more attendees not found' });
      }
      validAttendees = validAttendees.map((user) => user._id);
    }
    const meetingDate = new Date(date);
    if (isNaN(meetingDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (duration && (isNaN(duration) || duration <= 0)) {
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }

    const meeting = new Meeting({
      title,
      description: description || '',
      date: meetingDate,
      duration: duration ? Number(duration) : undefined,
      organizer: organizerId,
      attendees: validAttendees,
      location: venue || '',
      status: 'scheduled',
      createdAt: new Date(),
    });
    await meeting.save();
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'username email')
      .populate('attendees', 'username email');

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: populatedMeeting,
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAttendedMeetings = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const meetings = await Meeting.find({
      attendees: userId,
      organizer: { $ne: userId },
      status: 'scheduled',
    })
      .populate('organizer', '_id username email')
      .populate('attendees', '_id username email')
      .sort({ date: 1 })
      .lean();

    res.status(200).json({
      message: 'Attended meetings retrieved successfully',
      meetings,
    });
  } catch (error) {
    console.error('Error fetching attended meetings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getOrganizedMeetings = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(req.params);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const meetings = await Meeting.find({
      organizer: userId,
      status: 'scheduled',
    })
      .populate('organizer', '_id username email')
      .populate('attendees', '_id username email')
      .sort({ date: 1 })
      .lean();

    res.status(200).json({
      message: 'Organized meetings retrieved successfully',
      meetings,
    });
  } catch (error) {
    console.error('Error fetching organized meetings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const GetMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await Meeting.findById(meetingId)
      .populate({
        path: 'attendees',
        select: 'username _id'
      })
      .populate({
        path: 'organizer',
        select: 'username _id'
      })
      .populate({
        path: 'organization',
        select: 'name _id'
      })
      .populate({
        path: 'department',
        select: 'name _id'
      })
      .lean();

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const response = {
      _id: meeting._id,
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      duration: meeting.duration,
      status: meeting.status,
      location: meeting.location,
      createdAt: meeting.createdAt,
      organizer: meeting.organizer
        ? {
            _id: meeting.organizer._id,
            username: meeting.organizer.username
          }
        : null,
      attendees: meeting.attendees.map(attendee => ({
        _id: attendee._id,
        username: attendee.username
      })),
      organization: meeting.organization
        ? {
            _id: meeting.organization._id,
            name: meeting.organization.name
          }
        : null,
      department: meeting.department
        ? {
            _id: meeting.department._id,
            name: meeting.department.name
          }
        : null
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ message: 'Server error while fetching meeting' });
  }
};

export const TranscribeAudio = async (req, res) => {
  try {
    console.log('im here')
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('GROQ_API_KEY in TranscribeAudio:', process.env.GROQ_API_KEY);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
      language: 'ur',
      response_format: 'verbose_json',
    });

    fs.unlinkSync(filePath);

    res.json({
      text: transcription.text,
      segments: transcription.segments,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
};