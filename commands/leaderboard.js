const countingUtils = require("../utils/countingUtils")
const Discord = require("discord.js")
const config = require("../config.json");
const prisma = require("../utils/database");

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

module.exports.execute = async (client, message, args) => {
  var page = 1;
  var method = "count";
  const temporal = {};

  if (args && args[0]) {
    method = args[0];
    
    if (method !== "count" && method !== "sum" && method !== "temporal") return await message.channel.send(":x: Invalid method. Please choose either `count` or `sum`.");
  }

  if (args && args[1]) {
    page = parseInt(args[1])

    if (isNaN(page) || page < 1) return await message.channel.send(":x: Invalid page number.");
  }

  var users;
  
  if (method === "count") {
    users = await prisma.count.groupBy({
      by: ['user'],
      where: {
        NOT: {
          broke: true,
        },
        server: message.guildId
      },
      _count: {
        number: true,
      },
      orderBy: {
        _count: {
          number: 'desc'
        }
      },
      take: 10,
      skip: 10 * (page - 1)
    });
  } else if (method === "temporal") {

    users = await prisma.count.findMany({
      where: {
        server: message.guildId
      }
    });

    for await (const entry of users) {
      const diff = (Date.now() - new Date(entry.date)) / (1000 * 60 * 60 * 24);

      if (entry.user in temporal) {
        temporal[entry.user] += (entry.number / diff);
      } else {
        temporal[entry.user] = (entry.number / diff);
      }
    }

    Object.keys(temporal).map((key) => { temporal[key] = Math.floor(temporal[key]) });

    users = Object.values(temporal);
    users.sort();
    console.log(users)
  } else {
    users = await prisma.count.groupBy({
      by: ['user'],
      where: {
        NOT: {
          broke: true,
        },
        server: message.guildId
      },
      _sum: {
        number: true,
      },
      orderBy: {
        _sum: {
          number: 'desc'
        }
      },
      take: 10,
      skip: 10 * (page - 1)
    });
  }

  let leaderboardEmbed = new Discord.MessageEmbed();
  leaderboardEmbed.color = config.colors.embedColor;
  leaderboardEmbed.title = 'Server Counting Leaderboard';
  leaderboardEmbed.description = `No results found for this page.`

  if (users && users.length > 0) {
    leaderboardEmbed.description = `Using the ${method} metric. You only earn points on the leaderboard for messages that do not break the streak.`
    
    const guild = message.guild;
    await guild.members.fetch();

    var i = 0;

    
    for await (const user of users) {
      try {
        // This throws if the user isn't found. Problem?
        var userId = user.user;
        if (method === "temporal") userId = getKeyByValue(temporal, user);

        const userName = await guild.members.fetch(userId);

        i++;

        if (method === "count") {
          leaderboardEmbed.fields.push(
            {
              name: `#${i} - ${userName.user.username}#${userName.user.discriminator}`,
              value: `\`\`\`${user._count.number}\`\`\``,
              inline: false,
            }
          );
        } else if (method === "temporal") {
          leaderboardEmbed.fields.push(
            {
              name: `#${i} - ${userName.user.username}#${userName.user.discriminator}`,
              value: `\`\`\`${user / 100}\`\`\``,
              inline: false,
            }
          );
        } else {
          leaderboardEmbed.fields.push(
            {
              name: `#${i} - ${userName.user.username}#${userName.user.discriminator}`,
              value: `\`\`\`${user._sum.number}\`\`\``,
              inline: false,
            }
          );
        }
      } catch {}
    }
  }

  return await message.channel.send({ embeds: [leaderboardEmbed] });
};

module.exports.config = {
  name: 'leaderboard',
  aliases: [],
  module: 'Counting',
  description: 'Shows the leaderboard for the counting channel. You may optionally include a page number and a metric.\nThe default is page one and the "count" metric, which counts numbers written, as opposed to "sum", which is the sum of the numbers the user posted. There is also temporal, which goes down as time passes. It is required to include a metric if you want to specify a page number.',
  usage: ['leaderboard [count | sum | temporal] [page]'],
};
