import type { TextChannel } from "discord.js";
import config from "../config";
import { prisma } from "../utils/database";

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export class countingActions {
  static async checkNumber(client, message) {
    if (message.channel.id === config.channels.counting) {
      const number = parseInt(message.content);

      const userLastMessage = await prisma.countEntry.findFirst({
        where: {
          entry_user_id: message.author.id,
          entry_guild_id: message.guildId,
        },
        orderBy: {
          id: "desc",
        },
      });

      if (!userLastMessage) {
        await message.channel.send({
          content: `:wave: Welcome to the counting channel, <@${message.author.id}>! There are a few unique points about this channel that are helpful to know. Run \`/countinghelp\` to learn more!`,
        });
      }

      // We want the latest number, regardless of whether it broke the streak
      const lastNumber = await this.getLatest(message.guildId, false);

      if (isNaN(number) || number < 1) {
        const { next_number, broke } = await this.killCount(-1, message);

        if (!broke) return;

        return await message.channel.send(
          `Oops! Looks like <@${message.author.id}> broke the count by sending invalid text! The next number is **${next_number}**!`
        );
      }

      try {
        if (lastNumber && lastNumber.entry_next_number !== number) {
          const {next_number, broke} = await this.killCount(number, message);

          if (!broke) return;

          return await message.channel.send(
            `Oops! Looks like <@${message.author.id}> broke the count by breaking the streak! The next number is **${next_number}**!`
          );
        }

        if (lastNumber && lastNumber.entry_user_id === message.author.id) {
          const { next_number, broke } = await this.killCount(number, message);
        
          if (!broke) return;
        
          return await message.channel.send(
            `Oops! Looks like <@${message.author.id}> broke the count by sending two numbers in a row! The next number is **${next_number}**!`
          );
        }
      } catch (e) {
        console.error(e);
      }

      const { next_number } = await this.putLatest(
        number,
        message.author.id,
        message.id,
        message.guildId,
        false
      );

      if (number % 10000 === 0) return await message.react("🏅");
      if (number % 1000 === 0) return await message.react("🌠");
      if (number % 100 === 0) return await message.react("💯");
      await message.react("✅");
      return await this.easterEgg(client, message, number);
    }
  }

  static async getHighest(server) {
    const highest = await prisma.countEntry.findFirst({
      where: {
        entry_guild_id: server,
        entry_broke_streak: false,
      },
      orderBy: {
        entry_number: "desc",
      },
    });
    
    return highest ? highest.entry_number : 0;
  }

  static async updateChannel(channel: TextChannel, guild_id: string, next_number: number) {
    // const highest_number = await this.getHighest(guild_id);
    
    // if (channel.id === config.channels.counting) {
    //   try {
    //     setTimeout(async () => {
    //       await channel.setTopic(`The highest number is ${highest_number}.`);
    //     }, 1000);
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }
  }

  static async easterEgg(client, message, number) {
    const count = await this.countValid(message.author.id, message.guildId);
    if (count > 25) {
      const random = getRandom(0, 10000);
      const textChannel = await message.guild.channels.cache.get(config.channels.countingMessages);

      if (random < 10) {
        this.typeNumber(client, message, number);
      } else if (random >= 10 && random < 15) {
        await message.author.send(`Good job. Looks like you've send ${count} numbers before. Valid numbers, anyways. I forgot where I left the paper counting your wrong numbers and frankly am just too tired to find that right now.`)
      } else if (random >= 15 && random < 16) {
        await message.author.send(`Wow. Incredible. You've posted ${count} numbers. I think it's finally time to tell you a secret... the cult of 5040. Don't tell anyone, but it's been slowly growing this whole time. Every time someone posts a multiple of 5040, react to it with :thought_balloon:. Why?\n5040 is a factorial (7!), a superior highly composite number, abundant number, colossally abundant number and the number of permutations of 4 items out of 10 choices (10 × 9 × 8 × 7 = 5040). It is also one less than a square, making (7, 71) a Brown number pair. Also it's Plato's favorite number. Do you need any more reason to join? So start doing that, and if anyone asks, tell them nothing.`)
      } else if (random >= 16 && random < 20) {
        await textChannel.send("Just watching the count go up... :eyes:")
      } else if (random >= 20 && random < 30) {
        await textChannel.send("*Clever remark*")
      } else if (random >= 30 && random < 40) {
        await textChannel.send("Yes... keep counting... not harvesting data over here for nefarious *machine learning* purposes.")
      }
    }
  }

  static async typeNumber(client, message, number) {
    const increaseMessage = await message.channel.send(`${number + 1}`);
    return await this.checkNumber(client, increaseMessage);
  }

  static async mendBroken(client, message, action) {
    if (message.channel.id === config.channels.counting) {
      const number = parseInt(message.content);

      const lastDatabase = await this.getLatest(message.guildId, false);

      if (lastDatabase && lastDatabase.entry_number === number) {
        return await message.channel.send(
          `:warning: <@${lastDatabase.entry_user_id}> ${action} their last number. The next number is **${lastDatabase.entry_next_number}**.`
        );
      }
    }
  }

  static async getLatest(server, valid) {
    if (valid) {
      return await prisma.countEntry.findFirst({
        where: {
          entry_guild_id: server,
          entry_broke_streak: false,
        },
        orderBy: [{ entry_datetime: "desc" }],
      });
    } else {
      return await prisma.countEntry.findFirst({
        where: {
          entry_guild_id: server,
        },
        orderBy: [{ entry_datetime: "desc" }],
      });
    }
  }

  static async putLatest(number: number, user: string, message: string, server: string, broke: boolean) {
    var next = number + 1;
    if (broke) {
      const lastNumber = await this.getLatest(server, false);
      next = await this.findNext(user, server, lastNumber?.entry_next_number ?? 0);
    }

    const record = await prisma.countEntry.create({
      data: {
        entry_number: number > Number.MAX_SAFE_INTEGER ? -1 : number,
        entry_user_id: user,
        entry_message_id: message,
        entry_guild_id: server,
        entry_next_number: next,
        entry_broke_streak: broke,
      },
    });

    return { next_number: next, record };
  }

  static async findNext(user: string, server: string, lastNumber: number) {
    const allUsers = await prisma.countEntry.groupBy({
      by: ["entry_user_id"],
      where: {
        NOT: {
          entry_broke_streak: true,
        },
        entry_guild_id: server,
      },
      _count: {
        entry_message_id: true,
      },
    });

    var position = 0;

    for await (const a of allUsers) {
      if (a.entry_user_id === user) break;

      position++;
    }

    // This function calculates a "penalty" score for a user who breaks a streak in our counting game.
    //
    // This penalty serves several purposes:
    // 1. Discourages older, more active users from breaking streaks, as their penalty score will be significantly higher.
    // 2. The penalty score grows as users play more, adding an increasing stake and challenge to the game.
    // 3. Prevents new users from completely disrupting the game by deleting huge streaks, as their penalty will be less severe compared to the disruption they might cause.
    //
    // The penalty score is calculated based on the user's position in the overall user ranking and the total number of users.
    // The formula used is:
    //
    //   P = w * 2^(p - n) + (1 - w)
    //
    // Where:
    //   P is the penalty score.
    //   w is config.countWeight, a constant that represents the weight given to the user's position in the ranking.
    //   p is the user's position in the ranking.
    //   n is the total number of users.
    //
    // The weight w is a tunable parameter. When w is closer to 1, the user's position has a larger effect on the score.
    // When w is closer to 0, the user's position has less of an effect. This way, more "experienced" or higher-ranking users
    // receive a stiffer penalty, discouraging them from breaking streaks.
    const percentage = config.countWeight * Math.pow(2, position - allUsers.length) + (1 - config.countWeight);
    const next = lastNumber - Math.floor(percentage * lastNumber);

    return next < 1 ? 1 : next;
  }

  static async countValid(user, server) {
    return await prisma.countEntry.count({
      where: {
        entry_user_id: user,
        entry_guild_id: server,
        entry_broke_streak: false
      }
    })
  }

  static async killCount(number, message) {
    const {next_number, record} = await this.putLatest(
      number,
      message.author.id,
      message.id,
      message.guildId,
      true
    );
    
    const count = await this.countValid(message.author.id, message.guildId);
    if (count > 50) {
      const random = getRandom(0, 10000);
      const textChannel = await message.guild.channels.cache.get(config.channels.countingMessages);

      if (random < 10 && random > 2) {
        await textChannel.send(`Hey, just a reminder, <@${message.author.id}>, this channel is for counting *up*. :\\)`)
      } else if (random <= 2) {
        await prisma.countEntry.delete({
          where: {
            id: record.id
          }
        })

        const lastNumber = await this.getLatest(message.guildId, false);

        await message.delete();

        await textChannel.send(`Really <@${message.author.id}>? You broke the streak *again*? I think we should just collectively ignore that.${(lastNumber && lastNumber.entry_next_number) ? " The next number is " + lastNumber.entry_next_number + " everyone!": ""} `)

        return { next_number: next_number, record: record }
      } else if (random >= 10 && random <= 40) {
        await textChannel.send(`Hey! Just a friendly reminder that your mistakes are permanent, <@${message.author.id}>.`)
      } else if (random > 100 && random <= 200) {
        await textChannel.send(`And here I was, thinking you knew what you were doing, <@${message.author.id}>.`)
      } else if (random > 200 && random <= 250) {
        await textChannel.send(`*Developer note: remember to insert sarcastic comment about <@${message.author.id}>'s performance here.*`)
      } else if (random > 250 && random <= 300) {
        await textChannel.send(`Hey, <@${message.author.id}>. Constructive feedback: wrong number.`)
      } else if (random > 250 && random <= 300) {
        await textChannel.send(`<@${message.author.id}>. What would Diophantus think?`)
      } else if (random > 300 && random <= 350) {
        await textChannel.send(`<@${message.author.id}>, did you do that just so that I would say something witty? Well, I'm not, and I'm deducting points from your score for that.`)
      }
    } 

    await message.react("❌");

    return {next_number, broke: true};
  }
}