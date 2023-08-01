import { SlashCommandBuilder } from 'discord.js'
import type { ChatInputCommandInteraction } from 'discord.js'

export = {
  data: new SlashCommandBuilder()
    .setName('coffee')
    .setDescription('I will choose either :coffee: or :coffin:. (My version of Russian Roulette)'),
  async execute(interaction: ChatInputCommandInteraction) {
    const coffeeMessage = Math.random() < 0.5 ? ":coffee:" : ":coffin:";
    return await interaction.reply(coffeeMessage);
  },
};
