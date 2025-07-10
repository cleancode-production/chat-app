import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default {
  connect: async () => {
    mongoose.connection.on("connected", () => console.log(`connected to DB`));
    mongoose.connection.on("disconnected", () =>
      console.log(`disconnected from DB`)
    );
    mongoose.connection.on("error", (error) => console.log(`DB error`, error));

    await mongoose.connect(process.env.MONGO_DB_URI);
  },
  disconnect: async () => {
    await mongoose.disconnect();
  },
};
