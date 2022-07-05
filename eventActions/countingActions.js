const config = require('../config.json');
const prisma = require("../utils/database")

class countingActions {
  static async checkNumber(client, message) {
    if (message.channel.id === config.channels.counting) {
      const number = parseInt(message.content);

      // We want the latest number, regardless of whether it broke the streak
      const lastNumber = await this.getLatest(message.guildId, false);

      if (isNaN(number) || number < 1) return this.killCount(-1, message);

      try {
        if (lastNumber.next !== number) return this.killCount(number, message);
      } catch {}


      await this.putLatest(number, message.author.id, message.guildId, false);
      return message.react("✅")
    }
  }

  static async getLatest(server, broke) {
    if (broke) {
      return await prisma.count.findFirst({
        where: {
          server: server,
          broke: true
        },
        orderBy: [
          { date: 'desc' }
        ]
      })
    } else {
      return await prisma.count.findFirst({
        where: {
          server: server
        },
        orderBy: [
          { date: 'desc' }
        ]
      })
    }
  }

  static async putLatest(number, user, server, broke) {
    var next = number + 1;
    if (broke) {
      const lastNumber = await this.getLatest(server, false);
      next = await this.findNext(user, lastNumber);
    }

    await prisma.count.create({
      data: {
        message: number,
        user: user,
        server: server,
        next: next,
        broke: broke
      }
    })

    return next;
  }

  static async findNext(user, lastNumber) {
    const allUsers = await prisma.count.groupBy({
      by: ['user'],
      where: {
        NOT: {
          broke: true,
        },
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

    const percentage = ((config.countWeight) * (1/ (2^allUsers.length) ) * (2^position)) + (1 - config.countWeight);

    return lastNumber.message - Math.floor(percentage * lastNumber.message);
  }

  static async killCount(number, message) {
    const next = await this.putLatest(number, message.author.id, message.guildId, true);

    await message.react("❌");

    return await message.channel.send(`Oops! Looks like <@${message.author.id}> reset the count! The next number is **${next}**!`)
  }
}

module.exports = countingActions;
