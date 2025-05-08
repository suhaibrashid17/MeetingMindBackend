import express from 'express';
import { ChangeStatus, createMeeting, getAttendedMeetings, GetMeeting, getOrganizedMeetings, TranscribeAudio, SaveTranscription, AnalyzeTranscription, deleteMeeting } from '../controllers/meetingController.js';
import upload from '../middleware/multerConfig.js';

const router = express.Router();

router.post('/meeting', createMeeting);
router.get('/getattendedmeetings/:id', getAttendedMeetings);
router.get('/getorganizedmeetings/:id', getOrganizedMeetings);
router.get('/meeting/:id', GetMeeting);
router.post('/transcribe', upload.single('file'), TranscribeAudio);
router.patch('/meeting/:id/status', ChangeStatus);
router.post('/meeting/:id/transcription', SaveTranscription);
router.post('/meeting/:id/analyze', AnalyzeTranscription);
router.delete('/meeting/:id', deleteMeeting);

export default router;