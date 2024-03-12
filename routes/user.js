import express from "express";
import {
  deleteSlot,
  getAllDoctorSlots,
  getAllDoctors,
  getAllMessages,
  getAllPatients,
  getDoctorByDepartment,
  getAllDoctorAvailabeSlots,
  getAllDepartments,
  openSlot,
  updateProfile,
  updateProfilePhoto,
  bookSlot,
  getAllPatientSlots
} from "../controllers/user.js";
import { isPatient, isDoctor } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
const router = express.Router();

router.put("/update", updateProfile);
router.put("/profile-photo", upload.single("profile"), updateProfilePhoto);

//Message Routes
router.get("/messages/all/:receiverId", getAllMessages);

//Doctor Routes
router.get("/doctors/all", isPatient, getAllDoctors);

// PATIENT ROUTES
router.get("/patients/all", isDoctor, getAllPatients);

router.get(
  "/doctors/department/:departmentID",
  isPatient,
  getDoctorByDepartment
);

router.get("/departments", getAllDepartments);

router.get(
  "/patients/get-doctor-open-slots/:doctorId",
  getAllDoctorAvailabeSlots
);

router.put("/patients/book/:slotId", isPatient, bookSlot);
//Appointments - Slots Route - Doctor Slots
router.post("/doctors/slots/open", isDoctor, openSlot);
router.get("/doctors/slots/all", isDoctor, getAllDoctorSlots);
router.delete("/doctors/slots/delete/:slotId", isDoctor, deleteSlot);
router.get("/patients/slots/all", isPatient, getAllPatientSlots);

export default router;
