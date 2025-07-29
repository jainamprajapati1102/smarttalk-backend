import userModel from "../models/user.model.js";

export const createUser = async ({ name, mobile }) => {
  if (!name || !mobile) {
    throw new Error("All Feilds are required");
  }
  const user = await userModel.create({
    name,
    mobile,
  });

  return user;
};
