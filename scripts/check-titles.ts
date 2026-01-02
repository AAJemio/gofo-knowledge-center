
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const specific = await prisma.whatsappPrompt.findFirst({
        where: { title: { contains: 'Any Help Question' } }
    });

    if (specific) {
        console.log('Specific Check (Any Help Question):');
        console.log(`ID: ${specific.id}`);
        console.log(`EN: "${specific.title}"`);
        console.log(`ES: "${specific.title_es}"`);
    } else {
        console.log('"Any Help Question" prompt not found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
