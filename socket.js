import { Server } from "socket.io";
import { sendMessage } from "./controllers/user.js";
import aws from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();
aws.config.update({
  secretAccessKey: process.env.MYAWS_ACCESS_SECRET,
  accessKeyId: process.env.MYAWS_ACCESS_KEY,
  region: process.env.MYAWS_S3_REGION,
});

const myS3 = new aws.S3();

export function startSocketServer(expressServer) {
  const io = new Server(expressServer, {
    cors: {
      origin: [
        "https://client-his.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client Connected");

    // Listner for incoming messages
    socket.on("message-received", async (payload) => {
      const newMessage = await sendMessage(payload);

      // Emit the message to all the users listening on newMessage Channel SO WE WROTE IO.EMIT
      io.emit(newMessage.messageId, newMessage);
    });

    //Uploading incoming file to aws - s3
    socket.on("file-receiver", (payload) => {
      const { file, receiverId, senderId, fileName } = payload;

      // 1. Upload the file over s3
      const params = {
        Bucket: "hisproject",
        Key: fileName,
        Body: file,
      };

      myS3.upload(params, async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          data = {
            senderId,
            receiverId,
            message: data.Location,
          };
          const newMessage = await sendMessage(data, true);
          // Emit the message to all the users listening on newMessage Channel
          io.emit(newMessage.messageId, newMessage);
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("Client Disconnected");
    });
  });
}
