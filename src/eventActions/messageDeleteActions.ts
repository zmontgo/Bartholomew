import config from "../config";
import { EmbedBuilder } from "discord.js";

class deleteMessageActions {
  static async sendMessageToModeration(client, message) {
    const isBartholomewBot = message.author.id === client.user.id;

    const isCommand = message.content.startsWith(config.prefix);

    if (!(isBartholomewBot || isCommand)) {
      let embed = new EmbedBuilder()
        .setTitle("Message Deleted")
        .setColor(config.colors.embedColor)
        .setAuthor({
          name: `${message.author.username}#${message.author.discriminator}`,
          iconURL: message.author.displayAvatarURL()
        });
      embed.addFields({
        name: "Channel",
        value: message.channel,
        inline: true
      })

      if (message.content.length > 0) {
        embed.addFields({
          name: "Message",
          value: message.content,
          inline: false
        });
      }

      if (message.attachments.size > 0) {
        embed.addFields({
          name: "Files attached to message:",
          value: message.attachments.values().next().value.filename,
          inline: false
        });
      }

      client.channels.cache.get(config.channels.logs).send({ embeds: [embed] });
    }
  }
}
