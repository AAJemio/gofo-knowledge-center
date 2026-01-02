import { prisma } from '../src/lib/prisma';
import * as fs from 'fs';

async function checkDuplicates() {
    const prompts = await prisma.whatsappPrompt.findMany();
    const seen = new Set();
    const duplicates = [];

    for (const prompt of prompts) {
        // Create a unique key based on title and codes
        const key = `${prompt.title}-${prompt.code_impar_en}-${prompt.code_par_es}`;
        if (seen.has(key)) {
            duplicates.push(prompt);
        } else {
            seen.add(key);
        }
    }

    const report = `Total prompts: ${prompts.length}\nDuplicate count: ${duplicates.length}\n` +
        (duplicates.length > 0 ? 'Duplicates found:\n' + duplicates.map(d => `ID: ${d.id}, Title: ${d.title}, Codes: ${d.code_impar_en}/${d.code_par_es}`).join('\n') : 'No duplicates found based on Title + Codes.');

    fs.writeFileSync('duplicates_report.txt', report);
    console.log('Report written to duplicates_report.txt');
}

checkDuplicates()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
