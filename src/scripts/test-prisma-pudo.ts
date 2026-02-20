
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma PUDO operations...');

    try {
        // 1. Fetch prompts
        const prompts = await prisma.whatsappPrompt.findMany();
        console.log(`Found ${prompts.length} prompts.`);
        const validPromptId = prompts.length > 0 ? prompts[0].id : null;

        // 2. Try creating with NULL prompt ID
        console.log('Attempting to create Location with NULL prompt ID...');
        const loc1 = await prisma.pudoLocation.create({
            data: {
                name: 'Test Location Null Prompt',
                address: '123 Test St',
                businessDaysEn: 'Mon-Fri',
                businessDaysEs: 'Lun-Vie',
                businessHours: '9-5',
                contact: '555-0123',
                zipCode: '12345',
                whatsappPromptId: null,
                status: 'ACTIVE'
            }
        });
        console.log('Success (Null Prompt):', loc1.id);

        // 3. Update it to have a valid prompt ID (if available)
        if (validPromptId) {
            console.log('Attempting to update Location with valid prompt ID:', validPromptId);
            const loc2 = await prisma.pudoLocation.update({
                where: { id: loc1.id },
                data: { whatsappPromptId: validPromptId }
            });
            console.log('Success (Valid Prompt):', loc2.whatsappPromptId);
        }

        // 4. Cleanup
        console.log('Cleaning up...');
        await prisma.pudoLocation.delete({ where: { id: loc1.id } });
        console.log('Cleanup done.');

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
