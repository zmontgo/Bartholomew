import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import config from "../config";

const logschannel = config.channels.logs;

export = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Hugs a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to hug.")
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");

    if (user) {
      return await interaction.reply(
        `_Hugs <@${user.id}>._\nDon't worry, it'll be alright.`
      );
    } else {
      return await interaction.reply(
        `_Hugs <@${interaction.user.id}>._\nDon't worry, it'll be alright.`
      );
    }
  }
};

