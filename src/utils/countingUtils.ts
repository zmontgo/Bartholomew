import { prisma } from "./database";
import config from "../config";

export const countingUtils = {
  async getGuildData(server) {
    const sum = await prisma.count.count({
      where: {
        server: server,
      },
    });

    const broken = await prisma.count.count({
      where: {
        server: server,
        broke: true,
      },
    });

    const weight = config.countWeight;

    const allUsers = await prisma.count.groupBy({
      by: ["user"],
      where: {
        NOT: {
          broke: true,
        },
        server: server,
      },
      _count: {
        number: true,
      },
      orderBy: {
        _count: {
          number: "asc",
        },
      },
    });

    return [sum, broken, weight, allUsers.length];
  },

  async getUserData(userid, server): Promise<(number)[]> {
    const sum = await prisma.count.count({
      where: {
        AND: [{ user: userid }, { server: server }],
      },
    });

    const broken = await prisma.count.count({
      where: {
        server: server,
        user: userid,
        broke: true,
      },
    });

    const allUsers = await prisma.count.groupBy({
      by: ["user"],
      where: {
        NOT: {
          broke: true,
        },
        server: server,
      },
      _count: {
        number: true,
      },
      orderBy: {
        _count: {
          number: "asc",
        },
      },
    });

    var rank = 0;

    for await (const a of allUsers) {
      if (a.user === userid) break;

      rank++;
    }

    const latest = await prisma.count.findFirst({
      where: {
        AND: [{ user: userid }, { server: server }],
      },
      orderBy: [
        {
          date: "desc",
        },
      ],
    });

    const highest = await prisma.count.findFirst({
      where: {
        user: userid,
        server: server,
        broke: false,
      },
      orderBy: {
        number: "desc",
      },
    });

    return [sum, broken, rank, latest ? latest.number : 0, highest ? highest.number : 0];
  },
};
