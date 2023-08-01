import { SlashCommandBuilder } from 'discord.js'
import type { ChatInputCommandInteraction } from 'discord.js'

export = {
  data: new SlashCommandBuilder()
    .setName('choose')
    .setDescription('I will choose one of your options at random.')
    .addStringOption(option =>
      option.setName('options')
        .setDescription('The options to choose from, separated by commas')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const args = interaction.options.getString('options')?.split(/,+ */) ?? []

    if (args.includes("")) {
      return await interaction.reply("Choices cannot be empty!");
    }

    const choiceIndex = Math.floor(Math.random() * args.length);
    return await interaction.reply(
      "I choose **" + args[choiceIndex] + "**!"
    );
  },
};

