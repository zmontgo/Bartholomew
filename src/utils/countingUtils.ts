import { prisma } from "./database";
import config from "../config";

type UserTemporalScoreResult = {
  user: string;
  score: number;
};

export const countingUtils = {
  async getGuildData(server) {
    const sum = await prisma.countEntry.count({
      where: {
        entry_guild_id: server,
      },
    });

    const broken = await prisma.countEntry.count({
      where: {
        entry_guild_id: server,
        entry_broke_streak: true,
      },
    });

    const weight = config.countWeight;

    const allUsers = await prisma.countEntry.groupBy({
      by: ["entry_user_id"],
      where: {
        NOT: {
          entry_broke_streak: true,
        },
        entry_guild_id: server,
      },
      _count: {
        entry_number: true,
      },
      orderBy: {
        _count: {
          entry_number: "asc",
        },
      },
    });

    return [sum, broken, weight, allUsers.length];
  },

  async getUserData(userid, server): Promise<(number)[]> {
    const sum = await prisma.countEntry.count({
      where: {
        AND: [{ entry_user_id: userid }, { entry_guild_id: server }],
      },
    });

    const broken = await prisma.countEntry.count({
      where: {
        entry_guild_id: server,
        entry_user_id: userid,
        entry_broke_streak: true,
      },
    });

    const allUsers = await prisma.countEntry.groupBy({
      by: ["entry_user_id"],
      where: {
        NOT: {
          entry_broke_streak: true,
        },
        entry_guild_id: server,
      },
      _count: {
        entry_number: true,
      },
      orderBy: {
        _count: {
          entry_number: "asc",
        },
      },
    });

    var rank = 0;

    for await (const a of allUsers) {
      if (a.entry_user_id === userid) break;

      rank++;
    }

    const latest = await prisma.countEntry.findFirst({
      where: {
        AND: [{ entry_user_id: userid }, { entry_guild_id: server }],
      },
      orderBy: [
        {
          entry_datetime: "desc",
        },
      ],
    });

    const highest = await prisma.countEntry.findFirst({
      where: {
        entry_user_id: userid,
        entry_guild_id: server,
        entry_broke_streak: false,
      },
      orderBy: {
        entry_number: "desc",
      },
    });

    return [sum, broken, rank, latest ? latest.entry_number : 0, highest ? highest.entry_number : 0];
  },

  async getLeaderboard(method: "count" | "sum" | "temporal", page: number, guild_id: string): Promise<{ user: string; score: number }[]> {
    if (method === "count") {
      const users = await prisma.countEntry.groupBy({
        by: ["entry_user_id"],
        where: {
          NOT: {
            entry_broke_streak: true,
          },
          entry_guild_id: guild_id,
        },
        _count: {
          entry_number: true,
        },
        orderBy: {
          _count: {
            entry_number: "desc",
          },
        },
        take: 10,
        skip: 10 * (page - 1),
      });

      return users.map((user) => {
        return {
          user: user.entry_user_id,
          score: user._count.entry_number,
        };
      });
    } else if (method === "temporal") {
      const result = await prisma.$queryRaw<UserTemporalScoreResult[]>`
        SELECT entry_user_id as user, SUM(sub_scores) as score
        FROM (
          SELECT entry_user_id, calculate_score(entry_datetime, entry_number) as sub_scores
          FROM "CountEntry"
          WHERE NOT entry_broke_streak AND entry_guild_id = ${guild_id}
        ) as subquery
        GROUP BY entry_user_id
        ORDER BY score DESC
        LIMIT 10 OFFSET ${10 * (page - 1)};
      `;
        
      return result.map((user) => {
        return {
          user: user.user,
          score: Math.round(user.score),
        };
      });
    } else {
      const users = await prisma.countEntry.groupBy({
        by: ["entry_user_id"],
        where: {
          NOT: {
            entry_broke_streak: true,
          },
          entry_guild_id: guild_id,
        },
        _sum: {
          entry_number: true,
        },
        orderBy: {
          _sum: {
            entry_number: "desc",
          },
        },
        take: 10,
        skip: 10 * (page - 1),
      });

      return users.map((user) => {
        return {
          user: user.entry_user_id,
          score: user._sum.entry_number || 0,
        };
      });
    }
  }
};
