
import { prisma } from '../src/lib/prisma';

async function main() {
    const interactions = await prisma.interaction.findMany({
        include: {
            user: true,
            case: true,
            prompt: true
        }
    });
    console.log('Total Interactions:', interactions.length);
    console.log(JSON.stringify(interactions, null, 2));

    const users = await prisma.user.findMany({
        select: { id: true, email: true, usageCount: true }
    });
    console.log('Users:', JSON.stringify(users, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
