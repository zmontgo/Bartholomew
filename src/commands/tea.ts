import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export = {
  data: new SlashCommandBuilder()
    .setName("tea")
    .setDescription("I will choose either :tea: or :deciduous_tree:. (Tea-drinker's version of the coffee command)"),
  async execute(interaction: ChatInputCommandInteraction) {
    return await interaction.reply(Math.random() < 0.5 ? ":tea:" : ":deciduous_tree:");
  }
};
