const express = require('express');
const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
const User = require('../models/User');

const createMeeting =  async (req, res) => {
  try {
    const { attendees, date, description, duration, title, venue, organizerId } = req.body;
    console.log(req.body)
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

const getAttendedMeetings = async (req, res) => {
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

const getOrganizedMeetings = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(req.params)
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

module.exports = {createMeeting, getAttendedMeetings, getOrganizedMeetings};