import User from "../models/User.js";
import bcrypt from "bcrypt";
// import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// dotenv.config();
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //account doesnt exist
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email !! " });
    }
    if (user.active == false) {
      return res
        .status(400)
        .json({ success: false, message: "Your account is not active " });
    }
    //compare the password
    const result = await bcrypt.compare(password, user.password);
    // console.log(result);
    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password " });
    }

    // assign the token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.SECRET_KEY
    );

    return res.status(200).json({
      success: true,
      message: "Login Success",
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        about: user.about,
        address: user.address,
        imgUrl: user.imgUrl,
        accessToken: token,
        _id: user._id,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, gender } = req.body;

    //check if email already exists in db
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Email already taken " });
    }
    //hash the password before creating the user
    const hashedPassword = await bcrypt.hash(password, 6);
    console.log(`hashedppassword: ${hashedPassword}`);

    //create one account
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      gender,
    });

    //sending the activation email
    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSCODE,
      },
    });
    //Preparing the URL using the token
    const token = jwt.sign(
      {
        _id: newUser._id,
        role: newUser.role,
      },
      process.env.SECRET_KEY
    );

    const url = `http://localhost:3001/auth/verify/${token}`;

    let mailDetails = {
      from: process.env.EMAIL,
      to: email,
      subject: "Activation mail",
      text: `Hey , Click on the following URL to activate your account \n ${url}`,
    };

    //sending the email
    mailTransporter.sendMail(mailDetails);
    console.log(url);
    return res.status(200).json({
      success: true,
      message: "Email has been sent to activate your account ",
      newUser,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyAccount = async (req, res) => {
  const { token } = req.params;
  try {
    var decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded);
    await User.findByIdAndUpdate(decoded._id, { active: true });
    return res.status(200).json({
      success: true,
      message: "Your account is activated now, you can login now ",
    });
    // console.log(`decoded token ${decoded}`);
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Link expired or corrupted " });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    //check if the user exists in the Database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email , Account doesnt exist! please Sign up ",
      });
    }
    //Generating the reset token
    const resetToken = jwt.sign(
      {
        _id: user._id,
        email: user.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" } //Expiration for token
    );
    //sending the email
    const resetUrl = `http://localhost:3001/auth/reset-password/${resetToken}`;
    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSCODE,
      },
    });
    let mailDetails = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Your Password",
      text: `Hey , Click on the following URL to reset your password: \n ${resetUrl}`,
    };
    await mailTransporter.sendMail(mailDetails);
    console.log(resetUrl);
    return res.status(200).json({
      success: true,
      message: "Email has been sent to reset your password",
    });
  } catch (err) {
    return res.send(500).json({ success: false, message: err.message });
  }
};

//Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // User entering the new password in the form field
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 6);
    await User.findByIdAndUpdate(decoded._id, { password: hashedPassword });
    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Link expired or corrupted" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length == 0) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required " });
    }
    // For doc we are sending the password to email adn
    //letting the doc to change password

    // Fetch the user
    const user = await User.findById(req.user._id);
    //2.Verify the Old pasword
    const result = await bcrypt.compare(oldPassword, user.password);
    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "Password is not correct" });
    }
    //3.Change the password
    const hashedPassword = await bcrypt.hash(newPassword, 6);
    console.log(`hashedppassword: ${hashedPassword}`);
    user.password = hashedPassword;
    await user.save();
    // await User.findByIdAndUpdate(req.user._id), {password:hashedPassword}; - To avoid multiple DB calls , use the above two lines
    return res
      .status(200)
      .json({ Success: true, message: "password changed successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Link expired or corrupted" });
  }
};
