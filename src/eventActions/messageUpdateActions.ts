import config from "../config";
import { EmbedBuilder } from "discord.js";

class updateMessageActions {
  static async sendMessageToModeration(client, oldMessage, newMessage) {
    if (oldMessage.channel.id != config.channels.logs) {
      if (oldMessage.embeds.length == 0 && newMessage.embeds.length > 0) return; // Client likely had to fetch an embed from a link
      try {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${newMessage.author.username}#${newMessage.author.discriminator}`,
            iconURL: newMessage.author.displayAvatarURL(),
          })
          .setTitle(`Message Edited`)
          .setDescription(`Message edited in <#${newMessage.channel.id}>.`)
          .setColor(config.colors.embedColor);
        embed.addFields(
          {
            name: "Previous Content",
            value: oldMessage.content,
            inline: false
          },
          {
            name: "Current Content",
            value: newMessage.content,
            inline: false
          }
        )
        client.channels.cache
          .get(config.channels.logs)
          .send({ embeds: [embed] });
      } catch {
        // This will trigger if the message was empty (should be impossible) or if it was an embed, which is possible.
      }
    }
  }
}
