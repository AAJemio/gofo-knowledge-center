const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const prompts = await prisma.whatsappPrompt.findMany({
        select: { id: true, code_impar_en: true, code_par_es: true, title: true }
    });

    console.log(`Count: ${prompts.length}`);
    prompts.forEach(p => {
        console.log(`${p.id} | ${p.code_impar_en} | ${p.code_par_es} | ${p.title}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
