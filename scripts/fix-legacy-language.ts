
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('Checking for interactions with null language...');

    const updateResult = await prisma.interaction.updateMany({
        where: {
            type: 'prompt',
            language: null
        },
        data: {
            language: 'es'
        }
    });

    console.log(`Updated ${updateResult.count} legacy interactions to 'es'.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
