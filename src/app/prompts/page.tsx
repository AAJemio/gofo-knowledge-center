import { prisma } from '@/lib/prisma';
import PromptsViewer from '@/app/components/PromptsViewer';
import AKCNavigation from '@/components/AKCNavigation';

export const dynamic = 'force-dynamic';

export default async function PromptsPage() {
    const prompts = await prisma.whatsappPrompt.findMany({
        orderBy: {
            id: 'asc'
        }
    });

    // Transform data to match PromptsViewer expectations if necessary
    // The viewer expects: { id, title, category, codeEn, codeEs, english, spanish }
    // Our DB model has: { id, title, category, code_en, code_es, english, spanish }
    // We need to map code_en -> codeEn, code_es -> codeEs

    const formattedPrompts = prompts.map((p: any) => ({
        id: p.id,
        title: p.title,
        titleEs: p.title_es || p.title,
        category: p.category,
        codeEn: p.code_impar_en || '',
        codeEs: p.code_par_es || '',
        english: p.content_en,
        spanish: p.content_es
    }));

    return (
        <div className="min-h-screen bg-slate-50">
            <AKCNavigation />
            <PromptsViewer initialPrompts={formattedPrompts} />
        </div>
    );
}
