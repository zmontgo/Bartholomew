const countingUtils = require("../utils/countingUtils")
const Discord = require("discord.js")
const config = require("../config.json")

module.exports.execute = async (client, message) => {
  const data = await countingUtils.getGuildData(message.guild.id);

  if (!data)
    return await message.channel.send(':x: No data found for this guild!');

  const [sum, broken, weight, leaderboard_count] = data;

  let rankEmbed = new Discord.MessageEmbed();
  rankEmbed.color = config.colors.embedColor;
  rankEmbed.title = 'Server Meditation Stats';
  rankEmbed.fields.push(
    {
      name: 'Total Numbers Posted',
      value: `\`\`\`${sum}\`\`\``,
      inline: false,
    },
    {
      name: 'Streak Broken',
      value: `\`\`\`${broken}\`\`\``,
      inline: false,
    },
    {
      name: 'Weight',
      value: `\`\`\`${weight}\`\`\``,
      inline: false,
    },
    {
      name: 'Leaderboard Size',
      value: `\`\`\`${leaderboard_count}\`\`\``,
      inline: false,
    }
    
  );

  return await message.channel.send({ embeds: [rankEmbed] });
};

module.exports.config = {
  name: 'countingstats',
  aliases: ['stats'],
  module: 'Counting',
  description: 'Check on general counting stats about the server.',
  usage: ['countingstats'],
};
