import { countingUtils } from "../utils/countingUtils";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { prisma } from "../utils/database";
import config from "../config";

export = {
  config: {
    counting: true,
  },
  data: new SlashCommandBuilder()
    .setName("countingstats")
    .setDescription("Check on general counting stats about the server.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("server")
        .setDescription("Check on general counting stats about the server."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Check on general counting stats about a user.")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to get the stats of.")
            .setRequired(false)
            )),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return await interaction.reply("This command can only be used in a server.");
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "server") {
      await getServerStats(interaction);
    } else if (subcommand === "user") {
      await getUserStats(interaction);
    }    
  }
};

async function getServerStats(interaction: ChatInputCommandInteraction) {
  const isEphemeral = interaction.channel?.id === config.channels.counting;

  const data = await countingUtils.getGuildData(interaction.guild!.id);

  if (!data)
    return await interaction.reply({
      content: ":x: No data found for this server!",
      ephemeral: isEphemeral,
    });

  const {sum, broken, leaderboard_length} = data;

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
      name: "Streaks Broken",
      value: `\`\`\`${broken}\`\`\``,
      inline: false,
    },
    {
      name: "Leaderboard Size",
      value: `\`\`\`${leaderboard_length}\`\`\``,
      inline: false,
    }
  )
  .setFooter({ text: `Not sure what these mean? Run /countinghelp for more info.` });

  return await interaction.reply({ embeds: [rankEmbed], ephemeral: isEphemeral });
}

async function getUserStats(interaction: ChatInputCommandInteraction) {
  const isEphemeral = interaction.channel?.id === config.channels.counting;

  const user = interaction.options.getUser('user') ?? interaction.user

  const result = await prisma.countEntry.findMany({
    where: {
      AND: [
        {
          entry_user_id: user.id,
        },
        {
          entry_guild_id: interaction.guild!.id,
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
    return await interaction.reply({
      content: `:x: Looks like you don't have any entries in the counting channel! Go to <#${config.channels.counting}`,
      ephemeral: isEphemeral,
    });
  }

  const {
    sum,
    broken,
    rank,
    latest,
    highest
  } = await countingUtils.getUserData(user.id, interaction.guild!.id);

  let rankEmbed = new EmbedBuilder();
  rankEmbed
    .setColor(config.colors.embedColor)
    .setTitle("Counting Stats")
    .setThumbnail(user.avatarURL());

  rankEmbed.addFields(
    {
      name: "Rank",
      value: `\`\`\`${rank}\`\`\``,
      inline: false,
    },
    {
      name: "Numbers Posted",
      value: `\`\`\`${sum}\`\`\``,
      inline: false,
    },
    {
      name: "Streaks Broken",
      value: `\`\`\`${broken}\`\`\``,
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

    var date = new Date(latest.entry_datetime);
    var month = date.getUTCMonth();
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();

    const latestNumber = `**${
      latest.entry_number === -1 ? "Invalid Number" : latest.entry_number
    }** on ${months[month]} ${ordinalSuffix(day)}, ${year}`;

    rankEmbed.addFields({
      name: "Latest Number",
      value: `${latestNumber}`,
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

    var date = new Date(highest.entry_datetime);
    var month = date.getUTCMonth();
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();

    const highestNumber = `**${
      highest.entry_number === -1 ? "Invalid Number" : highest.entry_number
    }** on ${months[month]} ${ordinalSuffix(day)}, ${year}`;

    rankEmbed.addFields({
      name: "Highest Valid Number",
      value: `${highestNumber}`,
      inline: true,
    });
  }

  rankEmbed.setFooter({
    text: `Not sure what these mean? Run /countinghelp for more info.`,
  });

  return interaction.reply({ embeds: [rankEmbed], ephemeral: isEphemeral });
}

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