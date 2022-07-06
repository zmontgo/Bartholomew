import config from "../config";
import { afkAction } from "../eventActions/afkMessageCheckAction";
import { reactionCheckAction } from "../eventActions/reactions";
import { cafeActions } from "../eventActions/cafeActions";
import { countingActions } from "../eventActions/countingActions";

export = async (client, message) => {
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
  reactionCheckAction.checkIfCorrect(message);
  afkAction.checkIfUserIsAFK(client, message);
  afkAction.checkForMention(message);
};
