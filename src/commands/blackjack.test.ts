import { get_hands, draw, shoe_size } from "../utils/shuffle"
import Discord from "discord.js";

export const execute = async (client, message) => {
  const hands = await get_hands();
  const blackjack = new Discord.MessageEmbed({
    author: {
      name: message.author.tag,
      icon_url: message.author.avatarURL()
    },
    description: "`hit` - take another card\n`stand` - end your turn",
    fields: [
      {
        name: "**Your hand**",
        value: `\`\`\`${hands[0].join(" ")}\`\`\``,
        inline: true
      },
      {
        name: "**Dealer hand**",
        value: `\`\`\`${hands[1].join(" ")}\`\`\``,
        inline: true
      }
    ],
    footer: {
      text: `Cards left: ${await shoe_size()}`
    }
  });
  return await message.channel.send({embeds: [blackjack]});
};

export const architecture = {
  name: "blackjack",
  aliases: ["bj"],
  module: "Games",
  description: "BLACKJACK HAHA",
  usage: ["blackjack"],
};
