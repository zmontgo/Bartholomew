const prisma = require("./database")
const config = require("../config.json")

module.exports = {
  async getGuildData(server) {
    const sum = await prisma.count.count({
      where: {
        server: server,
      }
    });

    const broken = await prisma.count.count({
      where: {
        server: server,
        broke: true
      }
    })

    const weight = config.countWeight;

    const allUsers = await prisma.count.groupBy({
      by: ['user'],
      where: {
        NOT: {
          broke: true,
        },
        server: server
      },
      _count: {
        message: true,
      },
      orderBy: {
        _count: {
          message: 'asc'
        }
      }
    });

    return [
      sum,
      broken,
      weight,
      allUsers.length
    ]
  },

  async getUserData(userid, server) {
    const sum = await prisma.count.count({
      where: {
        AND: [{ user: userid }, { server: server }],
      },
    });

    const broken = await prisma.count.count({
      where: {
        server: server,
        user: userid,
        broke: true
      }
    });

    const allUsers = await prisma.count.groupBy({
      by: ['user'],
      where: {
        NOT: {
          broke: true,
        },
        server: server
      },
      _count: {
        message: true,
      },
      orderBy: {
        _count: {
          message: 'asc'
        }
      }
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
          date: 'desc'
        }
      ],
    });

    const highest = await prisma.count.findFirst({
      where: {
        user: userid,
        server: server,
        broke: false
      },
      orderBy: {
        message: "desc"
      }
    })

    return [
      sum,
      broken,
      rank,
      latest,
      highest
    ];
  }
}