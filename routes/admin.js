import express from "express";

import {
  createDoctor,
  getAllDoctors,
  createDepartment,
  getAllDepartments,
} from "../controllers/admin.js";
const router = express.Router();

router.get("/", getAllDoctors);
router.post("/doctor/create", createDoctor);
router.post("/department/create", createDepartment);
router.get("/departments", getAllDepartments);

export default router;
