import User from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Department from "../models/Department.js";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

//Admin can create a DOC account
export const createDoctor = async (req, res) => {
  try {
    const { name, email, phoneNumber, gender, departmentID } = req.body;

    //use the pasckage uuid to generate the random password
    const password = uuidv4();

    //if Doct als=ready exists
    const doctor = await User.findOne({ email });
    if (doctor) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor account already exists" });
    }
    //hash the password before creating the Doctor as a  user
    const hashedPassword = await bcrypt.hash(password, 6);
    console.log(`hashedppassword: ${hashedPassword}`);
    //create one account
    const newDoctor = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      gender,
      role: "DOCTOR",
      departmentID: departmentID,
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
        _id: newDoctor._id,
        email: newDoctor.email,
        name: newDoctor.name,
      },
      process.env.SECRET_KEY
    );

    const url = `http://localhost:3001/auth/verify/${token}`;

    let mailDetails = {
      from: process.env.EMAIL,
      to: email,
      subject: "Activation mail",
      text: `Hey Doctor ${name}  \n
      Your account is created for our portal you can login using following credetials \n
      email: ${email} \n
      password: ${password} \n

    In order to login first you have to activate your account using the link 
      
      \n ${url}`,
    };

    //sending the email
    mailTransporter.sendMail(mailDetails);
    console.log(url);
    return res.status(200).json({
      sucess: true,
      message: "Email has been sent to activate your account ",
      newDoctor,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

//Admin can see All doctors - get All doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "DOCTOR" }).populate(
      "departmentID",
      "name"
    );
    return res.status(200).json({ success: true, doctors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

//creating the Department - as a admin
export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    await Department.create({ name });
    return res
      .status(200)
      .json({ success: true, message: "Department Created successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

//getting all  the Department - as a admin
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    return res.status(200).json({ success: true, departments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
