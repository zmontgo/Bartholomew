const config = require('../config.json');
const Discord = require('discord.js');
const profanityTable = require('../profanity.json');

class profanityActions {
	static async checkForProfanity(client, message) {
		const bannedWords = await profanityTable.banned;

		var cleanmessage = "";
		var splitmsg = message.content.split(' ');
		var logchannel = client.channels.cache.get(config.channels.logs);
		var replacedwords = 0;

		await bannedWords.forEach(bannedWord => {
			if (message.content.toLowerCase().indexOf(bannedWord) != -1) {

				for (const word in splitmsg) {
					if (splitmsg[word].toLowerCase().indexOf(bannedWord) == -1) {
						cleanmessage = cleanmessage + splitmsg[word] + " ";
					} else {
						replacedwords += 1;
					}
				}
			}
    });

		if (replacedwords > 0) {
      message.delete();
      if(replacedwords == splitmsg.length) { // Only contains curse words
        const embedMessage = new Discord.MessageEmbed()
          .setColor(config.colors.embedColor)
          .setTitle(message.member.nickname
            ? message.member.nickname
            : message.author.username)
          .setDescription('Watch your language.');
        await message.channel.send(embedMessage).then(msg => {
          msg.delete({timeout: 5000})
        });
      } else {
        const embedMessage = new Discord.MessageEmbed()
          .setColor(config.colors.embedColor)
          .setTitle('Automatic Profanity Filter')
          .setDescription(`**${message.member.nickname
						? message.member.nickname
						: message.author.username}** said: "${cleanmessage.trim()}"`)
					.setFooter('Profanity removed.');
        await message.channel.send(embedMessage);
      }

			const logMessage = new Discord.MessageEmbed()
				.setColor(config.colors.embedColor)
				.setTitle("Profanity Replaced")
				.setDescription(`Profanity detected and replaced in ${message.channel}.`)
				.addField('User', message.author, true)
				.addField('Link', `[Go to message](${message.url})`, true)
				.addField('Message', `**${message.content}**`, true)
				.setFooter(
					message.author.username + '#' + message.author.discriminator,
					message.author.avatarURL
				);
			return await logchannel.send(logMessage);
		} else return;
	}
}

module.exports = profanityActions;
