import User from "../models/User.js";
import Messages from "../models/Messages.js";
import Appointments from "../models/Appointments.js";
import Departments from "../models/Department.js";

export const updateProfile = async (req, res) => {
  const { name, phone, about, address } = req.body;
  //Validation
  if (!name || name.length < 3)
    return res
      .status(400)
      .json({ success: false, message: "Name should be min 3 characters" });
  try {
    await User.findByIdAndUpdate(req.user._id, {
      name: name,
      phoneNumber: phone,
      about: about,
      address: address,
    });
    return res.status(200).json({ success: true, message: "Details Updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfilePhoto = async (req, res) => {
  if (req.file) {
    await User.findByIdAndUpdate(req.user._id, {
      imgUrl: req.file.location,
    });
    return res.status(200).json({
      success: true,
      message: "Profile Photo updated",
      imgUrl: req.file.location,
    });
  }
  return res
    .status(400)
    .json({ success: false, message: "File is not provided" });
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "DOCTOR", active: true })
      .select("name address gender email _id imgUrl phoneNumber about")
      .populate("departmentID", "name");

    return res.status(200).json({ success: true, doctors });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// console.log("get All doctors ", doctors);

export const getDoctorByDepartment = async (req, res) => {
  const { departmentID } = req.params;
  const doctors = await User.find({
    active: true,
    role: "DOCTOR",
    departmentID: departmentID,
  })
    .select("name address gender email _id imgUrl phoneNumber about")
    .populate("departmentID");
  return res.status(200).json({ success: true, doctors });
};
// console.log("get All doctors by DEPartment ID  ", doctors);

export const getAllDepartments = async (req, res) => {
  const departments = await Departments.find();
  return res.status(200).json({ success: true, departments });
};
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "PATIENT", active: true }).select(
      "name address gender email _id imgUrl phoneNumber"
    );

    return res.status(200).json({ success: true, patients });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const messageId =
      req.user._id >= receiverId
        ? req.user._id + receiverId
        : receiverId + req.user._id;
    const messages = await Messages.find({ messageId });
    res.status(200).json({ sucesss: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Invalid Request" });
  }
};

//Only for Websocket and its not an API call - it is a method not a controller
export const sendMessage = async (payload, file) => {
  const { senderId, receiverId, message } = payload;
  const messageId =
    senderId >= receiverId ? senderId + receiverId : receiverId + senderId;
  const messageDoc = await Messages.create({
    sender: senderId,
    receiver: receiverId,
    content: message,
    messageId,
    file,
  });
  return messageDoc;
  console.log(payload);
};

//Appointments

//Create - OPENING SLOT - who can create slots for appointment - Doctor
export const openSlot = async (req, res) => {
  const { start, end } = req.body;
  console.log(start, end);
  //is the slot already open
  const slot = await Appointments.findOne({
    openedBy: req.user._id,
    start,
    end,
  });
  console.log(slot);
  if (slot) {
    return res
      .status(400)
      .json({ success: false, message: "This slot already opened" });
  }
  const newSlot = await Appointments.create({
    openedBy: req.user._id,
    start,
    end,
  });
  return res
    .status(200)
    .json({ success: true, message: "Slot Opened", newSlot });
};
// 65eb84e8856c443e0a73e1fd - slot id for 14 march
//"65d38765dc2a8e398d1f1326" - user id for hello@gmail.com

//Read : Both Doctor &  Patients can read the slots
export const getAllDoctorSlots = async (req, res) => {
  //Forcing the Booking slot by using Patient ID
  // const t = await Appointment.findByIdAndUpdate("65eb84e8856c443e0a73e1fd", {
  //   bookedBy: "65d38765dc2a8e398d1f1326",
  //   isBooked: true,
  // });
  // console.log(t);
  const slots = await Appointments.find({ openedBy: req.user._id }).populate({
    path: "bookedBy", // Field to populate
    select: "name email imgUrl", // Select the fields you want to populate
  });
  return res.status(200).json({ success: true, slots });
};

//Delete: Doctor can delete the slots
export const deleteSlot = async (req, res) => {
  const { slotId } = req.params;
  const del = await Appointments.findOneAndDelete({
    _id: slotId,
    openedBy: req.user._id,
    isBooked: false,
  });
  if (del) {
    return res.status(200).json({ success: true, message: "Slot Deleted" });
  }
  return res.status(500).json({ success: true, message: "Invalid Details" });
};

// Patients
export const getAllDoctorAvailabeSlots = async (req, res) => {
  const { doctorId } = req.params;
  console.log(doctorId);
  const slots = await Appointments.find({
    openedBy: doctorId,
    isBooked: false,
  });
  return res.status(200).json({ success: true, slots });
};

//Update: Patients can book the slots

{
  /* Patients API  */
}

export const bookSlot = async (req, res) => {
  const { slotId } = req.params;
  const changed = await Appointments.findOneAndUpdate(
    {
      _id: slotId,
      isBooked: false,
    },
    {
      bookedBy: req.user._id,
      isBooked: true,
    }
  );
  if (!changed)
    return res.status(500).json({ success: false, message: "Invalid Slot" });

  return res.status(200).json({ success: true, message: "Slot Booked" });
};

export const getAllPatientSlots = async (req, res) => {
  try {
    const slots = await Appointments.find({ bookedBy: req.user._id }).populate(
      "openedBy",
      "name email imgUrl _id"
    ); // Assuming 'openedBy' is the doctor who opened the slot
    return res.status(200).json({ success: true, slots });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
