import { prisma } from '../src/lib/prisma';

async function removeDuplicates() {
    const prompts = await prisma.whatsappPrompt.findMany();
    const seen = new Set();
    const toDelete = [];

    for (const prompt of prompts) {
        // Create a unique key based on title and codes
        const key = `${prompt.title}-${prompt.code_impar_en}-${prompt.code_par_es}`;
        if (seen.has(key)) {
            toDelete.push(prompt.id);
        } else {
            seen.add(key);
        }
    }

    console.log(`Found ${toDelete.length} duplicates to delete.`);

    if (toDelete.length > 0) {
        const result = await prisma.whatsappPrompt.deleteMany({
            where: {
                id: {
                    in: toDelete
                }
            }
        });
        console.log(`Deleted ${result.count} duplicate prompts.`);
    } else {
        console.log('No duplicates to delete.');
    }
}

removeDuplicates()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
