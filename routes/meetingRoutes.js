import express from 'express';
import { createMeeting, getAttendedMeetings, getOrganizedMeetings } from '../controllers/meetingController.js';

const router = express.Router();

router.post('/meeting', createMeeting);
router.get('/getattendedmeetings/:id', getAttendedMeetings);
router.get('/getorganizedmeetings/:id', getOrganizedMeetings);

export default router;