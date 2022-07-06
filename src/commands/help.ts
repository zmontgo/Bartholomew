import Discord from "discord.js";
import config from "../config";
import fs from "fs";

let prefix;
if (fs.existsSync("../config")) {
  prefix = require("../config").prefix;
} else {
  prefix = ".";
}

function capitalizeFLetter(input) {
  return input[0].toUpperCase() + input.slice(1);
}

export const execute = async (client, message, args) => {
  let commands = client.commands;
  var modules = config.modules;
  console.log(modules)
  var cleanmodules = modules.map((v) => v.toLowerCase());
  let commandNames: any = [];

  if (!args || args.length === 0) {
    var modulelist = "";

    let helpMessage = new Discord.MessageEmbed()
      .setColor(config.colors.embedColor)
      .setTitle("List of available modules")
      .setDescription(
        `Modules available in ${message.guild.name}. Use \`.help [module]\` for more about a specific module, or \`.help all\` for all commands.`
      );
    modules.forEach((module) => {
      modulelist = modulelist.concat(`${module}\n`);
    });
    try {
      helpMessage.fields.push({ name: `All Modules`, value: `${modulelist}`, inline: false });
      return await message.channel.send({ embeds: [helpMessage] });
    } catch (err) {
      console.log(err);
    }
  } else if (args.length === 1) {
    let command = commands.find(
      (requestedcommand) =>
        requestedcommand.architecture.name === args[0].toLowerCase() ||
        requestedcommand.architecture.aliases.find(
          (alias) => alias === args[0].toLowerCase()
        )
    );

    if (command) {
      let helpMessage = new Discord.MessageEmbed()
        .setColor(config.colors.embedColor)
        .setTitle(`${prefix}${command.architecture.name}`)
        .setDescription(
          `You asked for information on \`${prefix}${command.architecture.name}\``
        );
      helpMessage.fields.push({name: "Description:", value: command.architecture.description, inline: false});

      if (command.architecture.aliases && command.architecture.aliases.length > 0) {
        const cleanAliases = "`" + command.architecture.aliases.join("`, `") + "`";

        helpMessage.fields.push({ name: "Aliases:", value: cleanAliases, inline: false });
      }

      if (command.architecture.usage && command.architecture.usage.length > 0) {
        const cleanUsage = "`" + command.architecture.usage.join("`, `") + "`";

        helpMessage.fields.push({ name: "Usage:", value: cleanUsage, inline: false });
      }

      try {
        message.channel.send({ embeds: [helpMessage] });
      } catch (err) {
        console.log(err);
      }
    } else {
      if (cleanmodules.includes(args[0].toLowerCase())) {
        var modCmd = args[0].toLowerCase(); // User input

        let helpMessage = new Discord.MessageEmbed()
          .setColor(config.colors.embedColor)
          .setTitle(`${capitalizeFLetter(modCmd)}`)
          .setDescription(`You asked for commands under the ${modCmd} module`);

        commands.forEach((requestedcommand) => {
          if (
            requestedcommand.architecture.module.toLowerCase() ==
            args[0].toLowerCase()
          ) {
            helpMessage.fields.push({
              name: `**${prefix}${requestedcommand.architecture.name}**`,
              value: `${requestedcommand.architecture.description}`,
              inline: false
          });
          }
        });
        try {
          message.channel.send({ embeds: [helpMessage] });
        } catch (err) {
          console.log(err);
        }
      } else if (args[0].toLowerCase() == "all") {
        modCmd = args[0].toLowerCase();

        let helpMessage = new Discord.MessageEmbed()
          .setColor(config.colors.embedColor)
          .setTitle(`${capitalizeFLetter(modCmd)}`)
          .setDescription(`You asked for all commands`);

        commands.forEach((requestedcommand) => {
          helpMessage.fields.push({
            name: `**${prefix}${requestedcommand.architecture.name}**`,
            value: `${requestedcommand.architecture.description}`,
            inline: false
          });
        });
        try {
          message.channel.send({ embeds: [helpMessage] });
        } catch (err) {
          console.log(err);
        }
      } else {
        commands.forEach((requestedcommand) => {
          commandNames.push(requestedcommand.architecture.name);
          requestedcommand.architecture.aliases.forEach((alias) =>
            commandNames.push(alias)
          );
        });
        return didYouMean(commandNames, args[0].toLowerCase(), message);
      }
    }
  }
};

async function didYouMean(commands, search, message) {
  if (!commands.includes(search)) {
    let score: any[] = [];
    let lev = 1000;
    let str: any[] = [];
    for (let command of commands) {
      if (levenshtein(search, command) <= lev) {
        lev = levenshtein(search, command);
        str.push(command);
      }
    }
    if (str.length > 1) {
      let arr: any[] = [];
      for (let string of str) {
        arr.push(string.split(""));
      }
      for (let i = 0; i < arr.length; i++) {
        score[i] = 0;
        for (let j = 0; j < arr[i].length; j++) {
          if (search.split("")[j] === arr[i][j]) {
            score[i]++;
          }
        }
      }
      return await message.channel
        .send(
          `Did you mean \`${prefix}help ${
            str[score.indexOf(Math.max(...score))]
          }\`?`
        )
        .catch((err) => console.log(err));
    } else {
      return await message.channel
        .send(`Did you mean \`${prefix}help ${str[0]}\`?`)
        .catch((err) => console.log(err));
    }
  }
}

function levenshtein(searchTerm, commandName) {
  if (searchTerm.length === 0) return commandName.length;
  if (commandName.length === 0) return searchTerm.length;
  let tmp, i, j, previous, val, row;
  if (searchTerm.length > commandName.length) {
    tmp = searchTerm;
    searchTerm = commandName;
    commandName = tmp;
  }

  row = Array(searchTerm.length + 1);
  for (i = 0; i <= searchTerm.length; i++) {
    row[i] = i;
  }

  for (i = 1; i <= commandName.length; i++) {
    previous = i;
    for (j = 1; j <= searchTerm.length; j++) {
      if (commandName[i - 1] === searchTerm[j - 1]) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, Math.min(previous + 1, row[j] + 1));
      }
      row[j - 1] = previous;
      previous = val;
    }
    row[searchTerm.length] = previous;
  }
  return row[searchTerm.length];
}

export const architecture = {
  name: "help",
  aliases: ["help"],
  module: "Utility",
  description:
    "I will send you this message, or the usage of a specific command.",
  usage: ["help", "help command"],
};
