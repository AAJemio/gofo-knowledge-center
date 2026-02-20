
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const kpis = await prisma.dailyKPI.findMany({
        include: { user: true }
    });
    console.log('Total KPIs found:', kpis.length);
    if (kpis.length > 0) {
        console.log('Sample KPI dates:', kpis.slice(0, 3).map(k => ({
            date: k.date,
            user: k.user.email
        })));
    } else {
        console.log('No KPIs found in database.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
