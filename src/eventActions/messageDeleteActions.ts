import config from "../config";
import Discord from "discord.js";

class deleteMessageActions {
  static async sendMessageToModeration(client, message) {
    const isBartholomewBot = message.author.id === client.user.id;

    const isCommand = message.content.startsWith(config.prefix);

    if (!(isBartholomewBot || isCommand)) {
      let embed = new Discord.MessageEmbed()
        .setTitle("Message Deleted")
        .setColor(config.colors.embedColor)
        .setAuthor({
          name: `${message.author.username}#${message.author.discriminator}`,
          iconURL: message.author.displayAvatarURL()
        });
      embed.fields.push({
        name: "Channel",
        value: message.channel,
        inline: true
      })

      if (message.content.length > 0) {
        embed.fields.push({
          name: "Message",
          value: message.content,
          inline: false
        });
      }

      if (message.attachments.size > 0) {
        embed.fields.push({
          name: "Files attached to message:",
          value: message.attachments.values().next().value.filename,
          inline: false
        });
      }

      client.channels.cache.get(config.channels.logs).send({ embeds: [embed] });
    }
  }
}
