import { readdirSync } from 'fs'
import path from 'path'
import { afkAction } from "../eventActions/afkMessageCheckAction";
import { reactionCheckAction } from "../eventActions/reactions";
import { cafeActions } from "../eventActions/cafeActions";
import { countingActions } from "../eventActions/countingActions";

export = async (client, message) => {
  if (message.author.bot) return

    const args = message.content.split(/\s+/g)
    let prefix = '.'

    if (
      args[0] === `<@!${client.user.id}>` ||
      message.content.startsWith(`<@!${client.user.id}>`)
    ) {
      prefix = `<@!${client.user.id}>`
      if (args[0] === prefix) {
        args.shift()
        args[0] = prefix + args[0] // Dirty fix
      }
    }

    const command =
      message.content.startsWith(prefix) && args.shift().slice(prefix.length).split(' ')[0].toLowerCase()

    if (command) {
      const commandfile = readdirSync(path.join(__dirname, '../commands/')).filter(file => file.endsWith('.js')).find(file => file === `${command}.js`)

      if (commandfile) {
        message.channel.sendTyping()

        return await message.channel.send('Message commands have been sunsetted. Please use slash commands instead.')
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
