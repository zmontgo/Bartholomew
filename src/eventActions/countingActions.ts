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
        const next = await this.killCount(-1, message);
        return await message.channel.send(
          `Oops! Looks like <@${message.author.id}> reset the count by sending invalid text! The next number is **${next}**!`
        );
      }

      try {
        if (lastNumber && lastNumber.next !== number) {
          const next = await this.killCount(number, message);
          return await message.channel.send(
            `Oops! Looks like <@${message.author.id}> reset the count by breaking the streak! The next number is **${next}**!`
          );
        }

        if (lastNumber && lastNumber.user === message.author.id) {
          const next = await this.killCount(number, message);
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
      return await this.typeNumber(client, message, number);
    }
  }

  static async typeNumber(client, message, number) {
    if (getRandom(0, 100) > 99) {
      const increaseMessage = await message.channel.send(`${number + 1}`);
      return await this.checkNumber(client, increaseMessage);
    }
  }

  static async mendBroken(client, message, action) {
    if (message.channel.id === config.channels.counting) {
      const number = parseInt(message.content);

      const lastDatabase = await prisma.count.findFirst({
        where: {
          server: message.guildId,
          message: message.id,
        },
        orderBy: {
          date: "asc",
        },
      });

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

    await prisma.count.create({
      data: {
        number: number > Number.MAX_SAFE_INTEGER ? -1 : number,
        user: user,
        message: message,
        server: server,
        next: next,
        broke: broke,
      },
    });

    return next;
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

  static async killCount(number, message) {
    const next = await this.putLatest(
      number,
      message.author.id,
      message.id,
      message.guildId,
      true
    );

    await message.react("❌");

    return next;
  }
}