import mongoose from "mongoose";


// Creating a mongoose Schema -
//gender, address, role
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "PATIENT", "DOCTOR"],
    required: true,
    default: "PATIENT",
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  departmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HisDepartments",
    required: false,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  about: {
    type: String,
    // required: true, // this is not required for registration apage
    default: "",
  },
  imgUrl: {
    type: String,
    required: true,
    default: "https://bootdey.com/img/Content/avatar/avatar7.png",
  },
});

export default mongoose.model("Hisusers", UserSchema);
