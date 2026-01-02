import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CaseForm from './CaseForm';

export default async function EditCasePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    // Handle "new" case creation
    const isNew = id === 'new';
    let supportCase = null;

    if (!isNew) {
        supportCase = await prisma.supportCase.findUnique({
            where: { id },
            include: { recommendedPrompts: true },
        });

        if (!supportCase) {
            notFound();
        }
    }

    const allPrompts = await prisma.whatsappPrompt.findMany({
        orderBy: { title: 'asc' },
    });

    return <CaseForm supportCase={supportCase} isNew={isNew} allPrompts={allPrompts} />;
}
