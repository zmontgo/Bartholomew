import Discord from "discord.js";
import config from "../config";

const logschannel = config.channels.logs;

export const execute = async (client, message, args) => {
  try {
    let logMessage = new Discord.MessageEmbed()
      .setColor(config.colors.embedColor)
      .setTitle(`\`.hug\` command deleted`);
    logMessage.fields.push(
      {
        name: "User:",
        value: message.author.tag,
        inline: false
      },
      {
        name: "Message:",
        value: message.content,
        inline: false
      },
      {
        name: "Channel:",
        value: message.channel,
        inline: false
      }
    )

    message.delete();

    try {
      message.guild.channels.cache
        .get(logschannel)
        .send({ embeds: [logMessage] });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log("Delete error" + err);
  }

  if (parseInt(args[0])) {
    return await message.channel.send(
      `_Hugs <@${args[0]}>._\nDon't worry, it'll be alright.`
    );
  } else {
    var name = args.join(" ");
    if (name == "") {
      return await message.channel.send(
        `_Hugs <@${message.author.id}>._\nDon't worry, it'll be alright.`
      );
    }
    //Replace with mention if possible
    message.channel.members.forEach((member) => {
      if (
        member.displayName.toLowerCase().indexOf(name.toLowerCase()) != -1 ||
        member.user.username.toLowerCase().indexOf(name.toLowerCase()) != -1
      )
        name = "<@" + member.id + ">";
    });
    if (name != "@everyone") {
      return await message.channel.send(
        `_Hugs ${name}._\nDon't worry, it'll be alright.`
      );
    } else {
      return await message.channel.send(
        `_Hugs the entire server._\nDon't worry, it'll be alright.`
      );
    }
  }
};

export const architecture = {
  name: "hug",
  aliases: ["hug"],
  module: "Fun",
  description: "Hugs specified user.",
  usage: ["hug [user]"],
};
