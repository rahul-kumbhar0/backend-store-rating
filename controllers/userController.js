const {Store, User, Rating} = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');


const getStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    const whereClause = {};

    // Apply filters if provided
    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (address) whereClause.address = { [Op.like]: `%${address}%` };

    const stores = await Store.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    // Add ratings information for each store
    const storesWithRatings = await Promise.all(stores.map(async (store) => {
      // Get overall rating
      const ratings = await Rating.findAll({
        where: { storeId: store.id }
      });
      
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = ratings.length > 0 ? (totalRating / ratings.length).toFixed(2) : '0.00';
      
      // Get user's rating for this store
      const userRating = await Rating.findOne({
        where: { 
          storeId: store.id,
          userId: req.user.id
        }
      });

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        overallRating: averageRating,
        userRating: userRating ? userRating.rating : null,
        userRatingId: userRating ? userRating.id : null
      };
    }));

    res.json(storesWithRatings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


//submit rating for a store

// const submitRating = async (req, res) =>{
//     try {
//         const {rating, storeId} = req.body;
//         if(!store){
//             return res.status(400).json({
//                 message:"Store not found"
//             });
//         }

//         //check the user are already rated on this store
//         const existingRating = await Rating.findOne({
//             where:{
//                 userId: req.user.id,
//                 storeId:storeId
//             }
//         });

//         if(existingRating){
//             return res.status(400).json({
//                 message:'You have already rated this store'
//             });
//         }

//         //create new rating
//         const newRating = await Rating.create({
//             rating,
//             userId: req.user.id,
//             storeId: storeId
//         });

//         res.status(201).josn(newRating);

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message:'Server error'
//         });
//     }
// };

// @desc    Submit rating for a store
// @route   POST /api/user/ratings
// @access  Private
const submitRating = async (req, res) => {
  const { rating, storeId } = req.body;

  try {
    console.log('=== Submit Rating Debug ===');
    console.log('User ID:', req.user.id);
    console.log('Store ID from request:', storeId);
    console.log('Rating value:', rating);

    // Check if store exists
    const store = await Store.findByPk(storeId);
    console.log('Store found:', store);

    if (!store) {
      return res.status(404).json({ 
        message: 'Store not found',
        storeId: storeId,
        debug: 'Make sure this store ID exists in the database'
      });
    }

    // Check if user has already rated this store
    const existingRating = await Rating.findOne({
      where: {
        userId: req.user.id,
        storeId: storeId
      }
    });

    console.log('Existing rating:', existingRating);

    if (existingRating) {
      return res.status(400).json({ 
        message: 'You have already rated this store',
        existingRatingId: existingRating.id
      });
    }

    // Create rating
    const newRating = await Rating.create({
      rating,
      userId: req.user.id,
      storeId: storeId
    });

    console.log('New rating created:', newRating);

    res.status(201).json(newRating);
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};


//update rating of store

const updateRating = async(req,res)=>{
    const {rating} = req.body;
    try {
        const existingRating = await Rating.findByPk(req.params.id);

        if(!existingRating){
            return res.status(404).json({
                message:"Rating not found"
            });
        }

        if(existingRating.userId !== req.user.id){
            return res.status(403).json({
                message:'Not authorized to update this rating'
            });
        }

        //update rating
        existingRating.rating = rating;
        await existingRating.save();

        res.json(existingRating);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"server error"
        })
    }
};


//to change the password

const changePassword = async(req, res)=>{

    const {currentPassword, newPassword} = req.body;
    try {
        const user = await User.findByPk(req.user.id);

        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        };

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if(!isMatch){
            return res.status(400).json({
                message:"Current password is incorrect"
            })
        };

        // validate the new password
        if(newPassword.length < 8 || newPassword.length > 16){
            return res.status(400).json({
                message:'Password must be between 8 and 16 characters'
            })
        };


        //hash the new password this 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error(error)
        re.status(500).json({
            message:"server error"
        });
    }
};


module.exports ={
    getStores,
    submitRating,
    updateRating,
    changePassword
};

