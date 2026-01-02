
import { prisma } from '../src/lib/prisma';

async function main() {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { interactions: true }
            }
        }
    });

    console.log('Syncing usage counts...');

    for (const user of users) {
        const actualCount = user._count.interactions;
        if (user.usageCount !== actualCount) {
            console.log(`Updating user ${user.email}: ${user.usageCount} -> ${actualCount}`);
            await prisma.user.update({
                where: { id: user.id },
                data: { usageCount: actualCount }
            });
        }
    }

    console.log('Sync complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
