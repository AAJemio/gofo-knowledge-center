import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PromptForm from './PromptForm';

export default async function EditPromptPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    // Handle "new" prompt creation
    const isNew = id === 'new';
    let prompt = null;

    if (!isNew) {
        prompt = await prisma.whatsappPrompt.findUnique({
            where: { id },
        });

        if (!prompt) {
            notFound();
        }
    }

    return <PromptForm prompt={prompt} isNew={isNew} />;
}
