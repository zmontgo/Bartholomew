import { countingUtils } from "../utils/countingUtils";
import config from "../config";
import { prisma } from "../utils/database";
import Discord from "discord.js";

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

export const execute = async (client, message, args) => {
  var get_usr = message.author.id;

  if (args[0]) {
    get_usr = args[0].match(/\d/g);

    if (get_usr === null)
      return await message.channel.send(
        ":x: Must be a user mention or user ID."
      );

    get_usr = get_usr.join("");
  }

  const result = await prisma.count.findMany({
    where: {
      AND: [
        {
          user: get_usr,
        },
        {
          server: message.guild.id,
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
    return await message.channel.send(
      `:x: Looks like you don't have any entries in the counting channel! Go to <#${config.channels.counting}`
    );
  }

  var [sum, broken, rank] = [0, 0, 0];
  var latest, highest;
  const data = await countingUtils.getUserData(get_usr, message.guild.id);

  if (data) {
    [sum, broken, rank, latest, highest] = data;
  }

  await message.guild.members.fetch();
  const user = client.users.cache.get(get_usr);

  const fields = [
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
  ];

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

    fields.push({
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

    fields.push({
      name: "Highest Valid Number",
      value: `${highest}`,
      inline: true,
    });
  }

  let rankEmbed = new Discord.MessageEmbed();
  rankEmbed.color = config.colors.embedColor;
  rankEmbed.title = "Meditation Stats";
  rankEmbed.thumbnail = user.avatarURL();
  rankEmbed.fields.push(...fields);

  return message.channel.send({ embeds: [rankEmbed] });
};

export const architecture = {
  name: "countingrank",
  aliases: ["rank"],
  module: "Counting",
  description: "Check on individual counting stats within the server.",
  usage: ["countingrank [user ID | user mention]"],
};
