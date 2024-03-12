import multer from "multer";
import aws from "aws-sdk";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

// export const upload = multer({ dest: "profile/" });
dotenv.config();
aws.config.update({
  secretAccessKey: process.env.AWS_ACCESS_SECRET,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

const myS3 = new aws.S3();

export const upload = multer({
  storage: multerS3({
    s3: myS3,
    acl: "public-read",
    bucket: "hisproject",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      console.log("inside the middleware", file);
      cb(null, file.originalname);
    },
  }),
});
