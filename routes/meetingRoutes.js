const express = require('express');
const router = express.Router();
const {createMeeting, deleteMeeting, updateMeeting} = require('../controllers/meetingController');

router.post('/meeting', createMeeting);
router.delete('/meeting/:meetingId', deleteMeeting);
router.put('/meeting/:meetingId', updateMeeting);

module.exports=router;