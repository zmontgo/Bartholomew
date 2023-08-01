import { SlashCommandBuilder } from 'discord.js'
import type { ChatInputCommandInteraction } from 'discord.js'

export = {
  data: new SlashCommandBuilder()
    .setName('cake')
    .setDescription('I will choose either :cake: or :snake:. (My version of Russian Roulette)'),
  async execute(interaction: ChatInputCommandInteraction) {
    const cakeMessage = Math.random() < 0.5 ? ":cake:" : ":snake:";
    return await interaction.reply(cakeMessage);
  },
};
