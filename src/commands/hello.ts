import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export = {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Says hello. Use to test if bot is online. Or when you need a friend."),
  async execute(interaction: ChatInputCommandInteraction) {
    return await interaction.reply("Hey there!");
  },
};
