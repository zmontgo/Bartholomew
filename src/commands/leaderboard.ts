import { countingUtils } from "../utils/countingUtils";
import { EmbedBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import config from "../config";

export = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the top 10 counters.")
    .addStringOption((option) =>
      option
        .setName("method")
        .setDescription("The method to use.")
        .setRequired(false)
        .addChoices(
          { name: "Count", value: "count" },
          { name: "Sum", value: "sum" },
          { name: "Temporal", value: "temporal" }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return await interaction.reply("This command can only be used in a server.");

    const method = (interaction.options.getString("method") || "count") as "count" | "sum" | "temporal";
    let page = 1;

    const users = await countingUtils.getLeaderboard(method, page, interaction.guild.id);

    let leaderboardEmbed = new EmbedBuilder()
      .setColor(config.colors.embedColor)
      .setTitle("Server Counting Leaderboard")
      .setDescription(`No results found for this page.`);

    if (users && users.length > 0) {
      leaderboardEmbed.setDescription(`Using the ${method} metric. You only earn points on the leaderboard for messages that do not break the streak.`);

      const guild = interaction.guild;
      await guild.members.fetch();

      var i = 0;

      for await (const user of users) {
        try {
          // This throws if the user isn't found. Problem?
          var userId = user.user;
          if (method === "temporal") userId = user[0];

          const userName = await guild.members.fetch(userId);

          i++;

          if (method === "count") {
            leaderboardEmbed.addFields({
              name: `#${i} - ${userName.user.username}#${userName.user.discriminator}`,
              value: `\`\`\`${user.score}\`\`\``,
              inline: false,
            });
          } else if (method === "temporal") {
            leaderboardEmbed.addFields({
              name: `#${i} - ${userName.user.username}#${userName.user.discriminator}`,
              value: `\`\`\`${user.score}\`\`\``,
              inline: false,
            });
          } else {
            leaderboardEmbed.addFields({
              name: `#${i} - ${userName.user.username}#${userName.user.discriminator}`,
              value: `\`\`\`${user.score}\`\`\``,
              inline: false,
            });
          }
        } catch {}
      }
    }

    return await interaction.reply({ embeds: [leaderboardEmbed] });
  }
};
