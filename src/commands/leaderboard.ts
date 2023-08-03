import { countingUtils } from "../utils/countingUtils";
import { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction } from "discord.js";
import config from "../config";

async function createLeaderboard(page: number, method: "temporal", interaction: ChatInputCommandInteraction) {
  const users = await countingUtils.getLeaderboard(method, page, interaction.guild!.id);
  let leaderboardEmbed = new EmbedBuilder()
      .setColor(config.colors.embedColor)
      .setTitle("Server Counting Leaderboard")
      .setDescription(`No results found for this page.`);

    if (users && users.length > 0) {
      leaderboardEmbed.setDescription(`You only earn points on the leaderboard for messages that do not break the streak.`);

      const guild = interaction.guild!;
      await guild.members.fetch();

      var i = 0;

      for await (const user of users) {
        try {
          // This throws if the user isn't found. Problem?
          var userId = user.user;
          if (method === "temporal") userId = user.user;

          const userName = await guild.members.fetch(userId);

          i++;

          leaderboardEmbed.addFields({
            name: `#${i} - ${userName.user.username}#${userName.user.discriminator}`,
            value: `\`\`\`${user.score}\`\`\``,
            inline: false,
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    leaderboardEmbed.setFooter({ text: `Page ${page}` });

    const paginationButtons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("leaderboard_prev")
          .setLabel("Previous Page")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId("leaderboard_next")
          .setLabel("Next Page")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(users.length < 10)
      );

    return { leaderboardEmbed, paginationButtons };
}

export = {
  config: {
    counting: true,
  },
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Check the counting leaderboard."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.channel) return await interaction.reply("This command can only be used in a server.");

    const method = "temporal";
    let page = 1;

    const {leaderboardEmbed, paginationButtons} = await createLeaderboard(page, method, interaction);

    const isEphemeral = interaction.channel.id === config.channels.counting;
    await interaction.reply({ embeds: [leaderboardEmbed], components: [paginationButtons], ephemeral: isEphemeral });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i) => {
      collector.resetTimer();

      if (i.customId === "leaderboard_prev") {
        page--;
      } else if (i.customId === "leaderboard_next") {
        page++;
      }

      const {leaderboardEmbed, paginationButtons} = await createLeaderboard(page, method, interaction);
      await i.update({ embeds: [leaderboardEmbed], components: [paginationButtons] });
    });

    collector.on("end", async (i) => {
      const {leaderboardEmbed, paginationButtons} = await createLeaderboard(page, method, interaction);
      await i.last()?.update({ embeds: [leaderboardEmbed], components: [paginationButtons] });
    });
  }
};
