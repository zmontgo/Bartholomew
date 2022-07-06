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
        .setAuthor(
          `${message.author.username}#${message.author.discriminator}`,
          message.author.displayAvatarURL()
        )
        .addField("Channel", message.channel, true);

      if (message.content.length > 0) {
        embed.addField("Message", message.content);
      }

      if (message.attachments.size > 0) {
        embed.addField(
          "Files attached to message:",
          message.attachments.values().next().value.filename
        );
      }

      client.channels.cache.get(config.channels.logs).send({ embeds: [embed] });
    }
  }
}

export default deleteMessageActions;
