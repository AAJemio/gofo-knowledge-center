
import { prisma } from '../src/lib/prisma';

async function main() {
    const email = 'ale@gofo.com';
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found');
        return;
    }

    const interactions = await prisma.interaction.findMany({
        where: { userId: user.id, type: 'prompt' },
        include: { prompt: true }
    });

    console.log('Interactions for ale@gofo.com:');
    interactions.forEach(i => {
        console.log(`Prompt: ${i.prompt?.title}, Language: ${i.language}, ID: ${i.id}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
