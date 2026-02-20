
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Debugging PUDO Update...');

    // 1. Create a dummy location
    const loc = await prisma.pudoLocation.create({
        data: {
            name: "Debug Loc",
            address: "123 St",
            businessDaysEn: "Mon",
            businessDaysEs: "Lun",
            businessHours: "9-5",
            contact: "111",
            zipCode: "00000",
            status: "ACTIVE"
        }
    });
    console.log('Created:', loc.id);

    try {
        // 2. Simulate the API payload processing
        // const body = { ...loc, whatsappPromptId: "" }; // Simulate empty string from form?

        // This is exactly what the API does:
        const name = "Updated Name";
        const address = "Updated Address";
        const businessDaysEn = "Tue";
        const businessDaysEs = "Mar";
        const businessHours = "10-6";
        const contact = "222";
        const zipCode = "11111";
        const imageUrl = undefined; // Undefined in body
        const whatsappPromptId = ""; // Empty string in body
        const status = "ACTIVE";

        console.log('Attempting update with sanitized values...');

        const updated = await prisma.pudoLocation.update({
            where: { id: loc.id },
            data: {
                name,
                address,
                businessDaysEn,
                businessDaysEs,
                businessHours,
                contact,
                zipCode,
                imageUrl: imageUrl || null,
                whatsappPromptId: whatsappPromptId || null,
                status
            }
        });
        console.log('Update Success:', updated);

    } catch (error) {
        console.error('Update Failed:', error);
    } finally {
        await prisma.pudoLocation.delete({ where: { id: loc.id } });
    }
}

main();
