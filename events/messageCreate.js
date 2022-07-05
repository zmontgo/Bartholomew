const config = require('../config.json');
const afkAction = require('../eventActions/afkMessageCheckAction');
const reactions = require('../eventActions/reactions');
const cafeActions = require('../eventActions/cafeActions');
const countingActions = require("../eventActions/countingActions");

module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const args = message.content.split(/\s+/g); // Return the message content and split the prefix.
  const command =
    message.content.startsWith(config.prefix) &&
    args.shift().slice(config.prefix.length);

  if (command) {
    const commandfile =
      client.commands.get(command) ||
      client.commands.get(client.aliases.get(command));

    if (commandfile) {
      message.channel.sendTyping();
      commandfile.execute(client, message, args); // Execute found command
    }
  }

  // Handle greetings
  countingActions.checkNumber(client, message);
  cafeActions.greetMorningOrNight(client, message);
  cafeActions.holidayReacts(client, message);
  reactions.checkIfCorrect(message);
  afkAction.checkIfUserIsAFK(client, message);
  afkAction.checkForMention(message);
};
