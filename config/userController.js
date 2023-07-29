const User = require("../models/userModel");

exports.updateUSer = async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updateUser);
  } catch (error) {
    res.status(500).json(error);
  }
};

// const blog = await Blog.deleteOne({ _id: id, user: req.user.user });

// get user by id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // destructured the user object. this allows me to get all other informations about a user except the password
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error);
  }
};
