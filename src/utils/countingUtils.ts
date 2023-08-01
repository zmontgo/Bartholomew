import { prisma } from "./database";
import config from "../config";

type UserTemporalScoreResult = {
  user: string;
  score: number;
};

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

  async getLeaderboard(method: "count" | "sum" | "temporal", page: number, guild_id: string): Promise<{ user: string; score: number }[]> {
    if (method === "count") {
      const users = await prisma.count.groupBy({
        by: ["user"],
        where: {
          NOT: {
            broke: true,
          },
          server: guild_id,
        },
        _count: {
          number: true,
        },
        orderBy: {
          _count: {
            number: "desc",
          },
        },
        take: 10,
        skip: 10 * (page - 1),
      });

      return users.map((user) => {
        return {
          user: user.user,
          score: user._count.number,
        };
      });
    } else if (method === "temporal") {
      const result = await prisma.$queryRaw<UserTemporalScoreResult[]>`
        SELECT user, calculate_score(date, number) as score
        FROM Count
        WHERE NOT broke AND server = ${guild_id}
        GROUP BY "user", "date"
        ORDER BY score DESC
        LIMIT 10 OFFSET ${10 * (page - 1)};
      `;
  
      return result;
    } else {
      const users = await prisma.count.groupBy({
        by: ["user"],
        where: {
          NOT: {
            broke: true,
          },
          server: guild_id,
        },
        _sum: {
          number: true,
        },
        orderBy: {
          _sum: {
            number: "desc",
          },
        },
        take: 10,
        skip: 10 * (page - 1),
      });

      return users.map((user) => {
        return {
          user: user.user,
          score: user._sum.number || 0,
        };
      });
    }
  }
};
