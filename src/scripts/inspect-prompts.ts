
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const prompts = await prisma.whatsappPrompt.findMany({
        take: 20,
        select: { id: true, title: true, category: true }
    });
    console.log(JSON.stringify(prompts, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
