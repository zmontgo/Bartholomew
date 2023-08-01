import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export = {
  data: new SlashCommandBuilder()
    .setName("toast")
    .setDescription("I will choose either :bread: or :fire:. (Toast version of `.coffee`)"),
  async execute(interaction: ChatInputCommandInteraction) {
    return await interaction.reply(Math.random() < 0.5 ? ":bread:" : ":fire:");
  }
};
