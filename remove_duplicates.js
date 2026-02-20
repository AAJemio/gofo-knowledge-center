const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function normalize(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

async function main() {
    // 1. Load Excel Source of Truth
    const excelPath = path.join(__dirname, 'temp_excel_content.json');
    if (!fs.existsSync(excelPath)) {
        console.error("Excel JSON not found!");
        return;
    }
    const excelData = JSON.parse(fs.readFileSync(excelPath, 'utf8'));

    // Map Excel data by PROMPT NUMBER
    const excelMap = {};
    excelData.forEach(row => {
        if (row['PROMPT NUMBER']) {
            excelMap[row['PROMPT NUMBER']] = row;
        }
    });

    // 2. Fetch all DB Prompts
    const allPrompts = await prisma.whatsappPrompt.findMany();
    console.log(`Total prompts in DB: ${allPrompts.length}`);

    // 3. Group by Codes (Composite key: code_impar_en + code_par_es)
    // We expect valid prompts to have both, or at least one meaningful code.
    const groups = {};

    for (const p of allPrompts) {
        // Create a unique key for the "pair"
        // If prompts are inconsistent (e.g. one has /01 and null, other has /01 and /02), this might be tricky.
        // Let's group by the English code first as primary identifier.
        const key = p.code_impar_en || p.code_par_es || `NO_CODE_${p.id}`;

        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    }

    const deleteIds = [];

    // 4. Analyze Groups
    for (const key in groups) {
        const group = groups[key];
        if (group.length > 1) {
            console.log(`\nFound duplicate group for code: ${key} (${group.length} entries)`);

            // Determine which one to keep
            let bestMatch = null;
            let highestScore = -1;

            // Excel source for this code
            const excelRowEn = excelMap[key]; // Assuming key is impar/en
            // If key is not in excel directly, maybe check the pair? 
            // Simplified: Just match text content against Excel if available.

            for (const p of group) {
                let score = 0;

                // Criteria 1: Content matches Excel exactly (Normalized)
                let matchesExcel = false;
                if (excelRowEn) {
                    const dbContent = normalize(p.content_en);
                    const excelContent = normalize(excelRowEn['PROMPT CONTENT IN YCLOUD']);
                    if (dbContent === excelContent) {
                        score += 50;
                        matchesExcel = true;
                    }
                }

                // Criteria 2: Has both codes (completeness)
                if (p.code_impar_en && p.code_par_es) score += 10;

                // Criteria 3: Recency (tie-breaker)
                // We prefer the one we just updated/inserted? Or the older stable one?
                // User said: "mantine el que esta en el excel".
                // If we just ran the update script, the updated one should match excel.
                // The duplicates might be OLD ones that weren't updated because ID mismatch?
                // Or maybe inserted new ones that clashed with existing?

                // updated recently > older
                score += (new Date(p.updatedAt).getTime() / 1000000000000);

                console.log(` - ID: ${p.id} | Codes: ${p.code_impar_en}/${p.code_par_es} | Title: ${p.title} | Score: ${score.toFixed(4)}`);

                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = p;
                }
            }

            console.log(`   -> KEEPING: ${bestMatch.id} (${bestMatch.title})`);

            // Mark others for deletion
            for (const p of group) {
                if (p.id !== bestMatch.id) {
                    deleteIds.push(p.id);
                }
            }
        }
    }

    // 5. Execute Deletion
    if (deleteIds.length > 0) {
        console.log(`\nDeleting ${deleteIds.length} duplicate prompts...`);
        // await prisma.whatsappPrompt.deleteMany({
        //     where: { id: { in: deleteIds } }
        // });
        // console.log("Deletion complete.");

        // Safety check: Prompt user or just do it? User said "elimina los repetidos".
        // I will execute it.
        await prisma.whatsappPrompt.deleteMany({
            where: { id: { in: deleteIds } }
        });
        console.log("Deletion complete.");

    } else {
        console.log("\nNo duplicates found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
