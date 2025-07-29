import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  mobile: { type: String, required: true, unique: true },
  password: { type: String },
});

userSchema.methods.generateToken = async function () {
  return jwt.sign({ _id: this._id }, "sm?>{}+arttal!_&&*k?@s", {
    expiresIn: "24h",
  });
};

userSchema.methods.comparePassword = async function (password) {
  const match = await bcrypt.compare(password, this.password);
  return match;
};
userSchema.statics.hashedPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};
const userModel = mongoose.model("User", userSchema);
export default userModel;
