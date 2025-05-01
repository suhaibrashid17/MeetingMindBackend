const express = require('express');
const router = express.Router();
const {createMeeting, getAttendedMeetings, getOrganizedMeetings} = require('../controllers/meetingController');

router.post('/meeting', createMeeting);
router.get('/getattendedmeetings/:id', getAttendedMeetings);
router.get('/getorganizedmeetings/:id', getOrganizedMeetings);
module.exports=router;