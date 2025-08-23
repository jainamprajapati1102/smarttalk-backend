import userModel from "../models/user.model.js";

export const createUser = async ({ name, mobile, profilePic }) => {
  if (!name || !mobile) {
    throw new Error("All Feilds are required");
  }
  console.log("frm service -->", name, mobile, profilePic);

  const user = await userModel.create({
    name,
    mobile,
    profilePic,
  });

  return user;
};
