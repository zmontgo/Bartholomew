import { countingUtils } from "../utils/countingUtils";
import Discord from "discord.js";
import config from "../config";

export const execute = async (client, message) => {
  const data = await countingUtils.getGuildData(message.guild.id);

  if (!data)
    return await message.channel.send(":x: No data found for this guild!");

  const [sum, broken, weight, leaderboard_count] = data;

  let rankEmbed = new Discord.MessageEmbed();
  rankEmbed.color = config.colors.embedColor;
  rankEmbed.title = "Server Counting Stats";
  rankEmbed.fields.push(
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

  return await message.channel.send({ embeds: [rankEmbed] });
};

export const architecture = {
  name: "countingstats",
  aliases: ["stats"],
  module: "Counting",
  description: "Check on general counting stats about the server.",
  usage: ["countingstats"],
};
