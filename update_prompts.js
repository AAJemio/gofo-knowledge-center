const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    // Load Report
    const reportPath = path.join(__dirname, 'comparison_report.json');
    if (!fs.existsSync(reportPath)) {
        console.error("Report not found!");
        return;
    }
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    console.log(`Applying ${report.updatesCount} updates...`);

    // 1. Apply Updates
    for (const update of report.updates) {
        const dataToUpdate = {};
        for (const change of update.changes) {
            dataToUpdate[change.field] = change.new;
        }

        if (Object.keys(dataToUpdate).length > 0) {
            try {
                await prisma.whatsappPrompt.update({
                    where: { id: update.dbId },
                    data: dataToUpdate
                });
                // process.stdout.write('.');
            } catch (error) {
                console.error(`Error updating ${update.dbId}:`, error.message);
            }
        }
    }
    console.log('\nUpdates completed.');

    console.log(`Processing ${report.newPromptsCount} new prompts...`);

    // 2. Process New Prompts (Pairing)
    const newPromptsMap = {};
    report.newPrompts.forEach(p => {
        newPromptsMap[p.code] = p;
    });

    const processedCodes = new Set();
    const pairsToInsert = [];

    // Simple pairing logic: /01A (odd) + /02A (even)
    // Regex to split number and suffix
    const codeRegex = /^\/(\d+)([A-Z]*)$/;

    for (const code of Object.keys(newPromptsMap)) {
        if (processedCodes.has(code)) continue;

        const match = code.match(codeRegex);
        if (match) {
            const num = parseInt(match[1]);
            const suffix = match[2];

            // Assume we are looking at the ODD side first (English)
            if (num % 2 !== 0) {
                const evenNum = num + 1;
                const evenCode = `/${evenNum.toString().padStart(2, '0')}${suffix}`; // Try 2-digit pad
                // Also try without padding if original didn't have it (though regex matched digits)
                // Actually the excel codes like /01A have padding. /77 might not if it's just /77.

                // Let's check if the "pair" exists in our new prompts list
                let pairCode = null;
                // Try padded and unpadded variants just in case
                const variants = [
                    `/${evenNum}${suffix}`,
                    `/${evenNum.toString().padStart(2, '0')}${suffix}`
                ];

                for (const v of variants) {
                    if (newPromptsMap[v]) {
                        pairCode = v;
                        break;
                    }
                }

                if (pairCode) {
                    // Found a pair!
                    processedCodes.add(code);
                    processedCodes.add(pairCode);

                    const oddPrompt = newPromptsMap[code];
                    const evenPrompt = newPromptsMap[pairCode];

                    pairsToInsert.push({
                        title: cleanTitle(oddPrompt.title),
                        title_es: cleanTitle(evenPrompt.title),
                        category: "General", // Default
                        code_impar_en: code,
                        code_par_es: pairCode,
                        content_en: oddPrompt.content,
                        content_es: evenPrompt.content
                    });
                } else {
                    console.warn(`Could not find pair for ${code}`);
                }
            } else {
                // If we hit an even number first, skip it, we'll catch it when processing the odd one
                // UNLESS the odd one is missing. 
                // But let's assume valid pairs for now based on report.
            }
        }
    }

    console.log(`Found ${pairsToInsert.length} pairs to insert.`);

    // 3. Insert New Pairs
    for (const pair of pairsToInsert) {
        try {
            await prisma.whatsappPrompt.create({
                data: pair
            });
            console.log(`Inserted pair: ${pair.code_impar_en} / ${pair.code_par_es}`);
        } catch (error) {
            console.error(`Error inserting pair ${pair.code_impar_en}:`, error.message);
        }
    }

    console.log('Done.');
}

function cleanTitle(title) {
    if (!title) return "Untitled";
    // Remove "ENGLISH_" or "SPANISH_" prefix if present
    return title.replace(/^(ENGLISH_|SPANISH_)\s*/i, '').replace(/\r\n/g, ' ').trim();
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
