import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import config from "../config";
import type { ChatInputCommandInteraction } from 'discord.js'

export = {
  config: {
    counting: true,
  },
  data: new SlashCommandBuilder()
    .setName('countinghelp')
    .setDescription('Shows help for the counting channel.'),
  async execute(interaction: ChatInputCommandInteraction) {
    const helpEmbed = new EmbedBuilder()
      .setColor(config.colors.embedColor)
      .setTitle("Counting Help")
      .setDescription("The counting channel is a channel where you can count up from 1 to infinity. It's a fun way to pass the time and chat with other people in the server. Here are some points to keep in mind while counting:")
      .setFields(
        {
          name: "1. Don't break the chain!",
          value: "```If you break the chain by sending a message without a number, or sending a number out of order, or sending two numbers in a row, the streak will be reduced. The streak is the number of consecutive numbers that have been sent without breaking the chain.```",
          inline: false,
        },
        {
          name: "2. Weight and Variable Streak Reduction",
          value: "```Your 'weight' represents how much you have contributed to the counting channel. If the chain is broken, the streak dips based on your weight. The higher your contribution, the larger the drop in the streak. So be attentive and keep the count alive!```",
          inline: false,
        },
        {
          name: "3. Leaderboard",
          value: "```Your score on the leaderboard is the sum of your counting contributions, with more recent ones valued higher due to exponential decay. For example, '100' added 24 hours ago contributes 36.79 points to your score. Stay active for a higher score!```",
          inline: false,
        },
        {
          name: "4. Counting Stats",
          value: "```You can check the leaderboard with \`/leaderboard\`. You can also check a user's or the server's counting stats with \`/countingstats\`.```",
          inline: false,
        },
      );
      
    const isEphemeral = interaction.channel?.id === config.channels.counting;
    return await interaction.reply({ embeds: [helpEmbed], ephemeral: isEphemeral });
  }
}