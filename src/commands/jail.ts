import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import config from "../config";

const logschannel = config.channels.logs;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

export = {
  data: new SlashCommandBuilder()
    .setName("jail")
    .setDescription("Jails a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to jail.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const prob = getRandomInt(100);

    if (prob == 99) {
      return await interaction.reply(
        `_${user} uses a "get out of jail free" card_`
      );
    } else {
      return await interaction.reply(`_Puts ${user} in jail._`);
    }
  }
};
