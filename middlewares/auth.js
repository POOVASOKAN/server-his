import jwt from "jsonwebtoken";

//Ensure The login - Middleware
export const isLoggedIn = (req, res, next) => {
  console.log(req.headers);

  try {
    //try to validate the token
    const token = req.headers.authorization;
    var decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    console.log("Decoded:", decoded);
    next();
  } catch (err) {
    return res.status(401).json({ Success: false, message: err.message });
  }
};

export const isAdmin = (req, res, next) => {
    console.log("role:",req.user.role); 
  if (req.user && req.user.role == "ADMIN") {
    next();
  } else {
    return res
      .status(401)
      .json({ success: false, message: "You Don't have access to this route" });
  }
};

export const isDoctor = (req, res, next) => {
  console.log("role:",req.user.role); 
if (req.user && req.user.role == "DOCTOR") {
  next();
} else {
  return res
    .status(401)
    .json({ success: false, message: "You Don't have access to this route" });
}
};


export const isPatient = (req, res, next) => {
  console.log("role:",req.user.role); 
if (req.user && req.user.role == "PATIENT") {
  next();
} else {
  return res
    .status(401)
    .json({ success: false, message: "You Don't have access to this route" });
}
};