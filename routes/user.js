const expres = require('express')
const { protect } = require('../middleware/auth');

const {
    getStores,
    submitRating,
    updateRating,
    changePassword
} = require('../controllers/userController');

const {ratingValidation} = require('../middleware/validation');


const router = expres.Router();

router.use(protect)

router.get('/stores', getStores);

//rating routes
router.post('/ratings', ratingValidation, submitRating);
router.put('/ratings/:id', ratingValidation, updateRating);

//user profiles
router.put('/change-password', changePassword)

module.exports = router;