
import { prisma } from '@/lib/prisma';

async function main() {
    const cases = await prisma.supportCase.findMany({
        where: {
            OR: [
                { title_es: { contains: 'Reenvio' } },
                { title_en: { contains: 'Reenvio' } },
                { title_es: { contains: 'General' } },
                { category: 'Delivery' }
            ]
        }
    });

    console.log('Found cases:', cases.length);
    cases.forEach(c => {
        console.log(`ID: ${c.id}, ES: ${c.title_es}, EN: ${c.title_en}, Category: ${c.category}`);
    });
}

main();
