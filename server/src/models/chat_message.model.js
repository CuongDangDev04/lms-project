const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const ChatMessage = sequelize.define(
  "Chat_Message",
  {
    message_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    participate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tagged_user_ids: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
    reply: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "chat_messages",
  }
);

module.exports = ChatMessage;
