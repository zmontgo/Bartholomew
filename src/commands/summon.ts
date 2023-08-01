import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import config from "../config";

const logschannel = config.channels.logs;

export = {
  data: new SlashCommandBuilder()
    .setName("summon")
    .setDescription("Summons a user.")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("User to summon.")
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return await interaction.reply("This command can only be used in a server.");

    const user = interaction.options.getUser("user");

    if (user) {
      return await interaction.reply(`_:candle: ${interaction.user} summons ${user}. :candle:_`);
    } else {
      return await interaction.reply(`_:candle: ${interaction.user} summons a genie. :candle:_`);
    }
  }
};
