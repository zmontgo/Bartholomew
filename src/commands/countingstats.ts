import { countingUtils } from "../utils/countingUtils";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import config from "../config";

export = {
  data: new SlashCommandBuilder()
    .setName("countingstats")
    .setDescription("Check on general counting stats about the server."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return await interaction.reply("This command can only be used in a server.");

    const data = await countingUtils.getGuildData(interaction.guild.id);

    if (!data)
      return await interaction.reply(":x: No data found for this server!");

    const [sum, broken, weight, leaderboard_count] = data;

    let rankEmbed = new EmbedBuilder();
    rankEmbed
      .setColor(config.colors.embedColor)
      .setTitle("Server Counting Stats")
      .setFields(
      {
        name: "Total Numbers Posted",
        value: `\`\`\`${sum}\`\`\``,
        inline: false,
      },
      {
        name: "Streak Broken",
        value: `\`\`\`${broken}\`\`\``,
        inline: false,
      },
      {
        name: "Weight",
        value: `\`\`\`${weight}\`\`\``,
        inline: false,
      },
      {
        name: "Leaderboard Size",
        value: `\`\`\`${leaderboard_count}\`\`\``,
        inline: false,
      }
    );

    return await interaction.reply({ embeds: [rankEmbed] });
  }
};
