const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper to normalize text for comparison (ignore whitespace differences)
function normalize(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

async function main() {
    // 1. Load Excel Data
    const excelPath = path.join(__dirname, 'temp_excel_content.json');
    if (!fs.existsSync(excelPath)) {
        console.error("Excel JSON not found!");
        return;
    }
    const excelData = JSON.parse(fs.readFileSync(excelPath, 'utf8'));

    // Map Excel data by PROMPT NUMBER for easy lookup
    const excelMap = {};
    excelData.forEach(row => {
        if (row['PROMPT NUMBER']) {
            excelMap[row['PROMPT NUMBER']] = row;
        }
    });

    // 2. Load DB Data
    const dbPrompts = await prisma.whatsappPrompt.findMany();

    const updates = [];
    const newPrompts = [];
    const seenCodes = new Set();

    // 3. Compare DB with Excel
    for (const prompt of dbPrompts) {
        let hasChanges = false;
        const changes = [];

        // Check English (Impar)
        const codeEn = prompt.code_impar_en;
        if (codeEn && excelMap[codeEn]) {
            seenCodes.add(codeEn);
            const excelRow = excelMap[codeEn];
            const excelContent = excelRow['PROMPT CONTENT IN YCLOUD'];

            if (normalize(prompt.content_en) !== normalize(excelContent)) {
                hasChanges = true;
                changes.push({
                    field: 'content_en',
                    old: prompt.content_en,
                    new: excelContent,
                    code: codeEn
                });
            }
        }

        // Check Spanish (Par)
        const codeEs = prompt.code_par_es;
        if (codeEs && excelMap[codeEs]) {
            seenCodes.add(codeEs);
            const excelRow = excelMap[codeEs];
            const excelContent = excelRow['PROMPT CONTENT IN YCLOUD'];

            if (normalize(prompt.content_es) !== normalize(excelContent)) {
                hasChanges = true;
                changes.push({
                    field: 'content_es',
                    old: prompt.content_es,
                    new: excelContent,
                    code: codeEs
                });
            }
        }

        if (hasChanges) {
            updates.push({
                dbId: prompt.id,
                title: prompt.title,
                changes
            });
        }
    }

    // 4. Find New Prompts in Excel (not in DB)
    const allExcelCodes = Object.keys(excelMap);
    const unseenCodes = allExcelCodes.filter(code => !seenCodes.has(code));

    // Group unseen codes into pairs if possible to propose "New Prompts"
    // Assumption: adjacent codes or matching /01A and /02A patterns?
    // For now, valid listing is enough.

    // Simple logic: just list them
    unseenCodes.forEach(code => {
        newPrompts.push({
            code,
            title: excelMap[code]['PROMPT TITLE'],
            content: excelMap[code]['PROMPT CONTENT IN YCLOUD']
        });
    });

    // Output Report
    const reportPath = path.join(__dirname, 'comparison_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        updatesCount: updates.length,
        newPromptsCount: newPrompts.length,
        updates,
        newPrompts
    }, null, 2));
    console.log('Report written to comparison_report.json');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
