
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Keywords map: Case Keyword -> Prompt Keyword (or Title part)
const KEYWORD_MAP: Record<string, string[]> = {
    'Tracking': ['Rastreo', 'Tracking', 'No Info'],
    'Delivery': ['Entregado', 'Delivered', 'Pod', 'Recepcion'],
    'Return': ['Retorno', 'Return', 'Devolucion', 'Reembolso'],
    'Modification': ['Cambio', 'Change', 'Direccion', 'Address'],
    'Complaint': ['Queja', 'Complaint', 'Reclamo'],
    'Security': ['Seguridad', 'Security', 'Policia'],
};

// Specific hardcoded links (Case ID/Title subset -> Prompt ID/Title subset)
// STRICT MODE: Only these IDs will be linked if the case matches.
const SPECIFIC_LINKS: Record<string, string[]> = {
    // Delivery Failures (Exact Matches)
    'Entrega Fallida / Sin Acceso': ['17', '15'], // No Access, Google Maps
    'Sin Respuesta Teléfono': ['17B'], // Phone No Answer
    'Negocio Cerrado': ['17C'], // Business Closed
    'Dirección Incorrecta': ['17H'], // Bad Address / Undeliverable
    'No Entregable': ['17H'],
    'Locker': ['41'], // Locker No Access

    // General Tracking/Status (Exact Matches)
    'Fake POD': ['27'], // ONLY Fake POD (User request)
    'Paquete Perdido': ['23', '29'], // Lost Parcel, Proof of Loss
    'Lost Package': ['23', '29'],
    'Daño': ['23B', '25'], // Damage prompts (Primary ones)
    'Reenvío': ['17K'], // Prepared for Redelivery
    'Reembolso': ['57', '59'], // Resolved Claim, Not Claimable
    'Policia': ['75'], // Call for Police
    'Robado': ['75'],
    'Wrong Recipient': ['05'], // Does Not Belong to Recipient
    'Retener Paquete': ['05B'], // Hold Parcel
    'Desechar Paquete': ['05C'], // Dispose Parcel
    'PUDO Fajardo': ['13'],
    'PUDO Morovis': ['13B'],
};

async function main() {
    console.log('Fetching all cases and prompts...');
    const allCases = await prisma.supportCase.findMany();
    const allPrompts = await prisma.whatsappPrompt.findMany();

    console.log(`Analyzing ${allCases.length} cases against ${allPrompts.length} prompts...`);

    let updatesCount = 0;

    for (const sCase of allCases) {
        const matchingPromptIds = new Set<string>();
        const caseTitle = (sCase.title_es || sCase.title_en || '').toLowerCase();
        const caseCategory = (sCase.category || '').toLowerCase();
        let matchedSpecific = false;

        // 1. Check Specific Links FIRST (Higher Priority & Exclusive)
        for (const [key, targetIds] of Object.entries(SPECIFIC_LINKS)) {
            if (caseTitle.includes(key.toLowerCase())) {
                // Find prompts matching specific IDs
                for (const targetId of targetIds) {
                    const found = allPrompts.find(p => p.id === targetId);
                    if (found) matchingPromptIds.add(found.id);
                }
                matchedSpecific = true;
            }
        }

        // 2. ONLY Check Keywords if NO specific link was found
        if (!matchedSpecific) {
            // Very strict keyword matching: Title must contain the keyword explicitly
            for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
                if (caseCategory.match(new RegExp(`\\b${cat.toLowerCase()}\\b`)) || caseTitle.includes(cat.toLowerCase())) {
                    for (const kw of keywords) {
                        // Strict: Prompt title must include the keyword
                        const found = allPrompts.filter(p =>
                            p.title.toLowerCase().includes(kw.toLowerCase()) ||
                            (p.title_es && p.title_es.toLowerCase().includes(kw.toLowerCase()))
                        );
                        // Add only top 1 match
                        found.slice(0, 1).forEach(p => matchingPromptIds.add(p.id));
                    }
                }
            }
        }

        if (matchingPromptIds.size > 0) {
            console.log(`\nCase: [${sCase.category}] ${sCase.title_es}`);
            console.log(`Recommended Prompts (${matchingPromptIds.size}):`);
            const promptsToLink = Array.from(matchingPromptIds).slice(0, 3); // Limit to 3 max for strictness

            for (const pid of promptsToLink) {
                const p = allPrompts.find(ap => ap.id === pid);
                console.log(`  - ${p?.title_es || p?.title} (${p?.id})`);
            }

            // Update DB using 'set' to overwrite previous recommendations
            await prisma.supportCase.update({
                where: { id: sCase.id },
                data: {
                    recommendedPrompts: {
                        set: promptsToLink.map(id => ({ id }))
                    }
                }
            });
            updatesCount++;
        } else {
            // Clear recommendations if no strict match found (to clean up "too many" from before)
            await prisma.supportCase.update({
                where: { id: sCase.id },
                data: {
                    recommendedPrompts: {
                        set: []
                    }
                }
            });
        }
    }

    console.log(`\nUpdated ${updatesCount} cases with recommended prompts.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
