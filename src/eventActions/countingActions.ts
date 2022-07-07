import config from "../config";
import { prisma } from "../utils/database";

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export class countingActions {
  static async checkNumber(client, message) {
    if (message.channel.id === config.channels.counting) {
      const number = parseInt(message.content);

      // We want the latest number, regardless of whether it broke the streak
      const lastNumber = await this.getLatest(message.guildId, false);

      if (isNaN(number) || number < 1) {
        const [next, killed] = await this.killCount(-1, message);

        if (!killed) return;

        return await message.channel.send(
          `Oops! Looks like <@${message.author.id}> reset the count by sending invalid text! The next number is **${next}**!`
        );
      }

      try {
        if (lastNumber && lastNumber.next !== number) {
          const [next, killed] = await this.killCount(number, message);

          if (!killed) return;

          return await message.channel.send(
            `Oops! Looks like <@${message.author.id}> reset the count by breaking the streak! The next number is **${next}**!`
          );
        }

        if (lastNumber && lastNumber.user === message.author.id) {
          const [next, killed] = await this.killCount(number, message);
        
          if (!killed) return;
        
          return await message.channel.send(
            `Oops! Looks like <@${message.author.id}> reset the count by sending two numbers in a row! The next number is **${next}**!`
          );
        }
      } catch {}

      await this.putLatest(
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

      if (lastDatabase && lastDatabase.number === number) {
        return await message.channel.send(
          `:warning: <@${lastDatabase.user}> ${action} their last number. The next number is **${lastDatabase.next}**.`
        );
      }
    }
  }

  static async getLatest(server, valid) {
    if (valid) {
      return await prisma.count.findFirst({
        where: {
          server: server,
          broke: false,
        },
        orderBy: [{ date: "desc" }],
      });
    } else {
      return await prisma.count.findFirst({
        where: {
          server: server,
        },
        orderBy: [{ date: "desc" }],
      });
    }
  }

  static async putLatest(number, user, message, server, broke) {
    var next = number + 1;
    if (broke) {
      const lastNumber = await this.getLatest(server, false);
      next = await this.findNext(user, server, lastNumber);
    }

    const record = await prisma.count.create({
      data: {
        number: number > Number.MAX_SAFE_INTEGER ? -1 : number,
        user: user,
        message: message,
        server: server,
        next: next,
        broke: broke,
      },
    });

    return [next, record];
  }

  static async findNext(user, server, lastNumber) {
    const allUsers = await prisma.count.groupBy({
      by: ["user"],
      where: {
        NOT: {
          broke: true,
        },
        server: server,
      },
      _count: {
        message: true,
      },
    });

    var position = 0;

    for await (const a of allUsers) {
      if (a.user === user) break;

      position++;
    }

    const percentage =
      config.countWeight *
        (Math.pow(2, position) / Math.pow(2, allUsers.length)) +
      (1 - config.countWeight);
    const next = lastNumber.next - Math.floor(percentage * lastNumber.next);

    return next < 1 ? 1 : next;
  }

  static async countValid(user, server) {
    return await prisma.count.count({
      where: {
        user: user,
        server: server,
        broke: false
      }
    })
  }

  static async killCount(number, message) {
    const [next, latest] = await this.putLatest(
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
        await prisma.count.delete({
          where: {
            id: latest.id
          }
        })

        const lastNumber = await this.getLatest(message.guildId, false);

        await message.delete();

        await textChannel.send(`Really <@${message.author.id}>? You broke the streak *again*? I think we should just collectively ignore that.${(lastNumber && lastNumber.next) ? " The next number is " + lastNumber.next + " everyone!": ""} `)

        return [next, false];
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

    return [next, true];
  }
}