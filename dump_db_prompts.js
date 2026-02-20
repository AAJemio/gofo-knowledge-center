const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const prompts = await prisma.whatsappPrompt.findMany({
        take: 5
    });
    console.log(JSON.stringify(prompts, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
