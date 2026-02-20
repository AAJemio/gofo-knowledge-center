const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Find user Miguel
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { firstName: { contains: 'Miguel', mode: 'insensitive' } },
                { lastName: { contains: 'Miguel', mode: 'insensitive' } },
                { firstName: { contains: 'Alfaro', mode: 'insensitive' } },
                { lastName: { contains: 'Alfaro', mode: 'insensitive' } }
            ]
        }
    });

    console.log('Found Users:', users.length);
    users.forEach(u => console.log(`- ${u.id}: ${u.firstName} ${u.lastName} (${u.email})`));

    if (users.length === 0) return;

    // 2. Check stats for these users
    const userIds = users.map(u => u.id);
    const stats = await prisma.dailyKPI.findMany({
        where: {
            userId: { in: userIds }
        },
        orderBy: { date: 'desc' },
        take: 20
    });

    console.log('\nRecent Stats:', stats.length);
    stats.forEach(s => {
        console.log(`- Date: ${s.date.toISOString().split('T')[0]}, Convs: ${s.conversations}, CSAT: ${s.csat}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
