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
      status: { $in: ['scheduled', 'in progress','done'] },
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
      status: { $in: ['scheduled', 'in progress', 'done'] },
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
      transcription: meeting.transcription || '',
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

export const ChangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid meeting ID' });
    }

    const validStatuses = ['scheduled', 'in progress', 'done'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: scheduled, in progress, done' 
      });
    }
    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.status(200).json({
      message: 'Meeting status updated successfully',
      meeting
    });

  } catch (error) {
    console.error('Error updating meeting status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const SaveTranscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { transcription } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid meeting ID' });
    }

    if (!transcription || typeof transcription !== 'string') {
      return res.status(400).json({ error: 'Transcription is required and must be a string' });
    }

    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { transcription },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.status(200).json({
      message: 'Transcription saved successfully',
      meeting
    });
  } catch (error) {
    console.error('Error saving transcription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const AnalyzeTranscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { transcription } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid meeting ID' });
    }

    if (!transcription || typeof transcription !== 'string') {
      return res.status(400).json({ error: 'Transcription is required and must be a string' });
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `
      You are an AI meeting assistant tasked with monitoring a meeting's transcription to ensure it adheres to the meeting agenda and maintains proper decorum. The meeting is conducted in Urdu, and all Urdu text is valid, professional, and expected. The meeting agenda is: "${meeting.description}".
      
      Your role:
      1. Analyze the provided transcription snippet to check if the discussion aligns with the agenda. Allow normal chit-chat, greetings, or brief off-topic remarks in Urdu, but flag significant deviations from the agenda.
      2. Check for violations of meeting decorum, such as abusive, toxic, or inappropriate language in Urdu. Do not flag Urdu text as unprofessional or inappropriate based on the language itself.
      3. If the discussion is on track and decorum is maintained, return "<Keep Going>".
      4. If there is a violation, return a message indicating the type of violation (agenda or decorum) and a brief explanation. For example:
         - Agenda violation: "The discussion is veering off-topic. Please return to the agenda: ${meeting.description}."
         - Decorum violation: "Inappropriate or abusive language detected. Please maintain professional decorum."

      Be concise, clear, and language-agnostic in your responses, focusing only on content and behavior, not the use of Urdu.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Transcription: ${transcription}` }
      ],
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      temperature: 0.7,
      max_completion_tokens: 256,
      top_p: 1,
      stream: false
    });

    const responseText = chatCompletion.choices[0].message.content;

    res.status(200).json({
      message: 'Transcription analyzed successfully',
      result: responseText
    });
  } catch (error) {
    console.error('Error analyzing transcription:', error);
    res.status(500).json({ error: 'Failed to analyze transcription' });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    console.log("im here")
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await Meeting.findByIdAndDelete(id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ message: 'Server error while deleting meeting' });
  }
};