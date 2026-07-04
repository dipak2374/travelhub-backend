import User from '../models/User.js';

export const toggleWishlist = async (req, res, next) => {
  try {
    const { itemId, itemModel } = req.body;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.findIndex((id) => id.toString() === itemId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
      user.wishlistModel.splice(index, 1);
    } else {
      user.wishlist.push(itemId);
      user.wishlistModel.push(itemModel);
    }

    await user.save();
    res.json({ success: true, wishlist: user.wishlist, message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const items = [];

    for (let i = 0; i < user.wishlist.length; i++) {
      try {
        const Model = (await import(`../models/${user.wishlistModel[i]}.js`)).default;
        const item = await Model.findById(user.wishlist[i]);
        if (item) items.push({ ...item.toObject(), itemModel: user.wishlistModel[i] });
      } catch {
        // skip invalid items
      }
    }

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
