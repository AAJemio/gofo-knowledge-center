
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const fileRecord = await prisma.kpiSourceFile.findUnique({
        where: { id }
    });

    if (!fileRecord) {
        return new NextResponse('File not found', { status: 404 });
    }

    // Return as file download
    return new NextResponse(fileRecord.fileData as any, {
        headers: {
            'Content-Disposition': `attachment; filename="${fileRecord.filename}"`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // Basic assumption, browsers handle nicely mostly
        }
    });
}
