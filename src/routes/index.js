const express = require('express');
const userRoutes = require('../domains/User/routes');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use('/users', userRoutes);

router.get('/agent-only', protect(['agent']), (req, res) => {
    res.json({ message: 'Agent access granted' });
});

module.exports = router;
