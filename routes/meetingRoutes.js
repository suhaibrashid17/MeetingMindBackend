import express from 'express';
import { createMeeting, getAttendedMeetings, GetMeeting, getOrganizedMeetings, TranscribeAudio } from '../controllers/meetingController.js';
import upload from '../middleware/multerConfig.js';

const router = express.Router();

router.post('/meeting', createMeeting);
router.get('/getattendedmeetings/:id', getAttendedMeetings);
router.get('/getorganizedmeetings/:id', getOrganizedMeetings);
router.get('/meeting/:id', GetMeeting);
router.post('/transcribe', upload.single('file'), TranscribeAudio);

export default router;