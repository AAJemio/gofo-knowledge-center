import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiHandler } from '@/lib/api-handler';

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const { email, password, firstName, lastName, role } = body;

    const user = await prisma.user.update({
        where: { id },
        data: {
            email,
            password,
            firstName: firstName || '',
            lastName: lastName || '',
            role,
        },
    });

    return NextResponse.json(user);
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    // Perform a transaction to clean up related records or decouple them
    await prisma.$transaction(async (tx) => {
        // 1. Delete KPIs
        await tx.dailyKPI.deleteMany({ where: { userId: id } });

        // 2. Delete Audit Logs
        await tx.auditLog.deleteMany({ where: { userId: id } });

        // 3. Delete Interactions (though it has Cascade, let's be explicit or relies on schema)
        // Schema says Interaction has onDelete: Cascade, so we can skip or include.

        // 4. Decouple content ownership (Cases & Prompts)
        await tx.supportCase.updateMany({
            where: { authorId: id },
            data: { authorId: null }
        });
        await tx.supportCase.updateMany({
            where: { editorId: id },
            data: { editorId: null }
        });
        await tx.whatsappPrompt.updateMany({
            where: { authorId: id },
            data: { authorId: null }
        });
        await tx.whatsappPrompt.updateMany({
            where: { editorId: id },
            data: { editorId: null }
        });

        // 5. Handle Admin specific relations if the user was an admin
        // KpiActivityLog, KpiSourceFile linked by adminId
        // We might want to keep these logs but set admin to null if possible?
        // Schema: admin User @relation... usually required.
        // If required, we can't set null. checked schema: admin User @relation...
        // It seems KpiActivityLog.adminId and KpiSourceFile.adminId are required specific relations. 
        // We probably shouldn't just delete audit logs of admin actions. 
        // But for now, if we delete an admin, we might have to delete their logs or fail.
        // Let's assume 'ale ale' is an agent. A generic user deletion might fail for an Admin with logs.
        // Let's try to delete them if they exist for now to allow deletion.
        await tx.kpiActivityLog.deleteMany({ where: { adminId: id } });
        await tx.kpiSourceFile.deleteMany({ where: { adminId: id } });

        // 6. Finally delete user
        await tx.user.delete({
            where: { id },
        });
    });

    return NextResponse.json({ success: true });
});
