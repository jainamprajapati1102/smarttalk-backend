import chatModel from "../models/chat.model.js";

export const createGroupChatService = ({
  chat_name,
  group_admin,
  users,
  is_group,
  group_profile,
}) => {
  try {
    const response = chatModel.create({
      chat_name,
      group_admin,
      group_profile,
      users,
      is_group,
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};
