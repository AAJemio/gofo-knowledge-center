import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { apiHandler } from '@/lib/api-handler';

export const POST = apiHandler(async (request: Request) => {
    const body = await request.json();
    const { type, id } = body;

    if (!id || !type) {
        throw new Error('Missing id or type');
    }

    // Track content usage
    if (type === 'case') {
        await prisma.supportCase.update({
            where: { id },
            data: { usage_count: { increment: 1 } },
        });
    } else if (type === 'prompt') {
        await prisma.whatsappPrompt.update({
            where: { id },
            data: { usage_count: { increment: 1 } },
        });
    } else {
        throw new Error('Invalid type');
    }

    // Track user usage (Interactions)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    if (token) {
        try {
            const userData = JSON.parse(token.value);
            if (userData && userData.id) {
                // Increment total count
                await prisma.user.update({
                    where: { id: userData.id },
                    data: { usageCount: { increment: 1 } },
                });

                // Log detailed interaction
                await prisma.interaction.create({
                    data: {
                        userId: userData.id,
                        type: type,
                        language: body.language || null,
                        caseId: type === 'case' ? id : undefined,
                        promptId: type === 'prompt' ? id : undefined,
                    },
                });
            }
        } catch (e) {
            console.error("Failed to update user usage", e);
            // Don't fail the request if user tracking fails
        }
    }

    return NextResponse.json({ success: true });
});
