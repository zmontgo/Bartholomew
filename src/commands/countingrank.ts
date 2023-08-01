import { countingUtils } from "../utils/countingUtils";
import config from "../config";
import { prisma } from "../utils/database";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from 'discord.js'

function ordinalSuffix(i) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

export = {
  data: new SlashCommandBuilder()
    .setName('countingrank')
    .setDescription('Shows your ranking in the counting channel.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get the ranking of')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return await interaction.reply("This command can only be used in a server.");

    const user = interaction.options.getUser('user') ?? interaction.user

    const result = await prisma.count.findMany({
      where: {
        AND: [
          {
            user: user.id,
          },
          {
            server: interaction.guild.id,
          },
        ],
      },
      orderBy: [
        {
          id: "desc",
        },
      ],
      take: 3,
    });

    if (!result) {
      return await interaction.reply(
        `:x: Looks like you don't have any entries in the counting channel! Go to <#${config.channels.counting}`
      );
    }

    var [sum, broken, rank] = [0, 0, 0];
    var latest, highest;
    const data = await countingUtils.getUserData(user, interaction.guild.id);

    if (data) {
      [sum, broken, rank, latest, highest] = data;
    }

    let rankEmbed = new EmbedBuilder();
    rankEmbed
      .setColor(config.colors.embedColor)
      .setTitle("Counting Stats")
      .setThumbnail(user.avatarURL());

    rankEmbed.addFields(
      {
        name: "Numbers Posted",
        value: `\`\`\`${sum}\`\`\``,
        inline: false,
      },
      {
        name: "Streak Broken",
        value: `\`\`\`${broken}\`\`\``,
        inline: false,
      },
      {
        name: "Rank",
        value: `\`\`\`${rank}\`\`\``,
        inline: false,
      },
    );

    if (latest) {
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      var date = new Date(latest.date);
      var month = date.getUTCMonth();
      var day = date.getUTCDate();
      var year = date.getUTCFullYear();

      latest = `**${
        latest.number === -1 ? "Invalid Number" : latest.number
      }** on ${months[month]} ${ordinalSuffix(day)}, ${year}`;

      rankEmbed.addFields({
        name: "Latest Number",
        value: `${latest}`,
        inline: true,
      });
    }

    if (highest) {
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      var date = new Date(highest.date);
      var month = date.getUTCMonth();
      var day = date.getUTCDate();
      var year = date.getUTCFullYear();

      highest = `**${
        highest.number === -1 ? "Invalid Number" : highest.number
      }** on ${months[month]} ${ordinalSuffix(day)}, ${year}`;

      rankEmbed.addFields({
        name: "Highest Valid Number",
        value: `${highest}`,
        inline: true,
      });
    }

    return interaction.reply({ embeds: [rankEmbed] });
  }
};
