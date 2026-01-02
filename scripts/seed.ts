import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import 'dotenv/config';

const prisma = new PrismaClient();

async function extractDataFromHtml(filePath: string, variableName: string) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Find the script tag containing the variable
    const scriptRegex = /<script([\s\S]*?)>([\s\S]*?)<\/script>/g;
    let match;
    let targetScriptContent = '';
    let isBabel = false;

    while ((match = scriptRegex.exec(content)) !== null) {
        const attributes = match[1];
        const scriptBody = match[2];
        if (scriptBody.includes(`const ${variableName} =`) || scriptBody.includes(`var ${variableName} =`)) {
            targetScriptContent = scriptBody;
            if (attributes.includes('text/babel')) {
                isBabel = true;
            }
            break;
        }
    }

    if (!targetScriptContent) {
        throw new Error(`Could not find script tag containing ${variableName}`);
    }

    const elementMock: any = {
        value: '',
        innerText: '',
        innerHTML: '',
        style: {},
        classList: { add: () => { }, remove: () => { }, toggle: () => { }, contains: () => false, replace: () => { } },
        addEventListener: () => { },
        appendChild: () => { },
        setAttribute: () => { },
        dataset: {},
        focus: () => { },
        select: () => { },
        click: () => { },
        querySelectorAll: () => [],
        querySelector: () => null,
    };
    elementMock.querySelector = () => elementMock;
    elementMock.querySelectorAll = () => [elementMock];

    const context = {
        React: { useState: () => { }, useEffect: () => { }, useRef: () => { } },
        ReactDOM: { createRoot: () => ({ render: () => { } }) },
        document: {
            getElementById: () => elementMock,
            addEventListener: () => { },
            createElement: () => elementMock,
            body: elementMock,
            execCommand: () => { },
            querySelectorAll: () => [elementMock],
            querySelector: () => elementMock,
        },
        window: {
            isSecureContext: true,
            lucide: { createIcons: () => { } },
            marked: { parse: (t: string) => t }
        },
        navigator: { clipboard: { writeText: () => Promise.resolve() } },
        alert: () => { },
        console: { log: () => { }, warn: () => { } },
        location: {},
        localStorage: { setItem: () => { }, getItem: () => { } },
        marked: { parse: (t: string) => t },
        lucide: { createIcons: () => { } }
    };
    vm.createContext(context);

    if (isBabel) {
        console.log(`Using manual extraction for ${variableName} (Babel/JSX detected)`);
        const startMarker = `const ${variableName} = [`;
        const startIndex = targetScriptContent.indexOf(startMarker);
        if (startIndex === -1) throw new Error(`Could not find start of ${variableName}`);

        const openBracketIndex = targetScriptContent.indexOf('[', startIndex);
        let bracketCount = 1;
        let i = openBracketIndex + 1;
        let inString = false;
        let stringChar = '';
        let inComment = false;
        let inMultiComment = false;

        while (i < targetScriptContent.length && bracketCount > 0) {
            const char = targetScriptContent[i];
            const nextChar = targetScriptContent[i + 1];

            if (inString) {
                if (char === '\\') { i += 2; continue; }
                if (char === stringChar) inString = false;
                i++; continue;
            }
            if (inComment) {
                if (char === '\n') inComment = false;
                i++; continue;
            }
            if (inMultiComment) {
                if (char === '*' && nextChar === '/') { inMultiComment = false; i += 2; continue; }
                i++; continue;
            }
            if (char === '/' && nextChar === '/') { inComment = true; i += 2; continue; }
            if (char === '/' && nextChar === '*') { inMultiComment = true; i += 2; continue; }
            if (char === '"' || char === '\'' || char === '`') { inString = true; stringChar = char; i++; continue; }
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
            i++;
        }

        const arrayString = targetScriptContent.substring(openBracketIndex, i);
        const code = `var ${variableName} = ${arrayString};`;
        vm.runInContext(code, context);
    } else {
        console.log(`Executing full script for ${variableName}`);
        vm.runInContext(targetScriptContent, context);

        if (!context[variableName as keyof typeof context]) {
            try {
                const result = vm.runInContext(variableName, context);
                return result;
            } catch (e) {
                throw new Error(`Variable ${variableName} not found after execution: ${e}`);
            }
        }
    }

    return context[variableName as keyof typeof context];
}


const TRANSLATIONS: Record<string, string> = {
    'Greeting': 'Saludo',
    'Closing': 'Despedida',
    'Order Status': 'Estado del Pedido',
    'Delivery Issue': 'Problema de Entrega',
    'Return Request': 'Solicitud de Devolución',
    'Payment Issue': 'Problema de Pago',
    'Product Inquiry': 'Consulta de Producto',
    'Feedback': 'Comentarios',
    'Complaint': 'Queja',
    'Refund': 'Reembolso',
    'Address Change': 'Cambio de Dirección',
    'Cancellation': 'Cancelación',
    'Confirmation': 'Confirmación',
    'Delay': 'Retraso',
    'Out of Stock': 'Agotado',
    'Promotion': 'Promoción',
    'Technical Support': 'Soporte Técnico',
    'Account Issue': 'Problema de Cuenta',
    'General Inquiry': 'Consulta General',
    'Welcome': 'Bienvenida',
    'Follow Up': 'Seguimiento',
    'Apology': 'Disculpa',
    'Thank You': 'Agradecimiento',
    'Verification': 'Verificación',
    'Reminder': 'Recordatorio',
    'Survey': 'Encuesta',
    'Instructions': 'Instrucciones',
    'Policy': 'Política',
    'Warranty': 'Garantía',
    'Shipping': 'Envío',
    'Tracking': 'Rastreo',
    'Invoice': 'Factura',
    'Discount': 'Descuento',
    'Membership': 'Membresía',
    'Password Reset': 'Restablecer Contraseña',
    'Login Issue': 'Problema de Inicio de Sesión',
    'Registration': 'Registro',
    'Unsubscribe': 'Darse de Baja',
    'Terms of Service': 'Términos de Servicio',
    'Privacy Policy': 'Política de Privacidad',
    'Contact Info': 'Información de Contacto',
    'Hours of Operation': 'Horario de Atención',
    'Location': 'Ubicación',
    'Social Media': 'Redes Sociales',
    'Website': 'Sitio Web',
    'App': 'Aplicación',
    'Download': 'Descargar',
    'Update': 'Actualizar',
    'Maintenance': 'Mantenimiento',
    'Error': 'Error',
    'Success': 'Éxito',
    'Warning': 'Advertencia',
    'Info': 'Información',
    'Help': 'Ayuda',
    'Support': 'Soporte',
    'FAQ': 'Preguntas Frecuentes',
    'Chat': 'Chat',
    'Call': 'Llamada',
    'Email': 'Correo Electrónico',
    'SMS': 'SMS',
    'WhatsApp': 'WhatsApp',
    'Facebook': 'Facebook',
    'Instagram': 'Instagram',
    'Twitter': 'Twitter',
    'LinkedIn': 'LinkedIn',
    'YouTube': 'YouTube',
    'TikTok': 'TikTok',
    'Pinterest': 'Pinterest',
    'Snapchat': 'Snapchat',
    'Reddit': 'Reddit',
    'Tumblr': 'Tumblr',
    'Telegram': 'Telegram',
    'Signal': 'Signal',
    'WeChat': 'WeChat',
    'Line': 'Line',
    'Viber': 'Viber',
    'Skype': 'Skype',
    'Zoom': 'Zoom',
    'Google Meet': 'Google Meet',
    'Microsoft Teams': 'Microsoft Teams',
    'Slack': 'Slack',
    'Discord': 'Discord',
    'Trello': 'Trello',
    'Asana': 'Asana',
    'Monday': 'Monday',
    'Jira': 'Jira',
    'Notion': 'Notion',
    'Evernote': 'Evernote',
    'Dropbox': 'Dropbox',
    'Google Drive': 'Google Drive',
    'OneDrive': 'OneDrive',
    'Box': 'Box',
    'iCloud': 'iCloud',
    'Amazon': 'Amazon',
    'eBay': 'eBay',
    'Etsy': 'Etsy',
    'Shopify': 'Shopify',
    'WooCommerce': 'WooCommerce',
    'Magento': 'Magento',
    'BigCommerce': 'BigCommerce',
    'Squarespace': 'Squarespace',
    'Wix': 'Wix',
    'WordPress': 'WordPress',
    'Stripe': 'Stripe',
    'PayPal': 'PayPal',
    'Square': 'Square',
    'Apple Pay': 'Apple Pay',
    'Google Pay': 'Google Pay',
    'Visa': 'Visa',
    'Mastercard': 'Mastercard',
    'American Express': 'American Express',
    'Discover': 'Discover',
    'Bitcoin': 'Bitcoin',
    'Ethereum': 'Ethereum',
    'Litecoin': 'Litecoin',
    'Dogecoin': 'Dogecoin',
    'USDT': 'USDT',
    'USDC': 'USDC',
    'BUSD': 'BUSD',
    'DAI': 'DAI',
    'XRP': 'XRP',
    'ADA': 'ADA',
    'SOL': 'SOL',
    'DOT': 'DOT',
    'AVAX': 'AVAX',
    'MATIC': 'MATIC',
    'LINK': 'LINK',
    'UNI': 'UNI',
    'ALGO': 'ALGO',
    'ATOM': 'ATOM',
    'XLM': 'XLM',
    'VET': 'VET',
    'ICP': 'ICP',
    'FIL': 'FIL',
    'TRX': 'TRX',
    'THETA': 'THETA',
    'XTZ': 'XTZ',
    'EOS': 'EOS',
    'AAVE': 'AAVE',
    'KSM': 'KSM',
    'XMR': 'XMR',
    'NEO': 'NEO',
    'MIOTA': 'MIOTA',
    'ETC': 'ETC',
    'BSV': 'BSV',
    'DASH': 'DASH',
    'ZEC': 'ZEC',
    'MKR': 'MKR',
    'COMP': 'COMP',
    'SNX': 'SNX',
    'YFI': 'YFI',
    'SUSHI': 'SUSHI',
    'UMA': 'UMA',
    'RUNE': 'RUNE',
    'ZIL': 'ZIL',
    'BAT': 'BAT',
    'DCR': 'DCR',
    'QTUM': 'QTUM',
    'ONT': 'ONT',
    'NANO': 'NANO',
    'WAVES': 'WAVES',
    'OMG': 'OMG',
    'ICX': 'ICX',
    'ZRX': 'ZRX',
    'KNC': 'KNC',
    'BNT': 'BNT',
    'REN': 'REN',
    'LRC': 'LRC',
    'MANA': 'MANA',
    'ENJ': 'ENJ',
    'OCEAN': 'OCEAN',
    'RLC': 'RLC',
    'NMR': 'NMR',
    'BAND': 'BAND',
    'BAL': 'BAL',
    'CRV': 'CRV',
    'SXP': 'SXP',
    'KAVA': 'KAVA',
    'ANT': 'ANT',
    'GNO': 'GNO',
    'MLN': 'MLN',
    'REP': 'REP',
    'LPT': 'LPT',
    'OXT': 'OXT',
    'STORJ': 'STORJ',
    'ANKR': 'ANKR',
    'SC': 'SC',
    'LSK': 'LSK',
    'STEEM': 'STEEM',
    'HIVE': 'HIVE',
    'BTS': 'BTS',
    'ARDR': 'ARDR',
    'KMD': 'KMD',
    'ARK': 'ARK',
    'PIVX': 'PIVX',
    'SYS': 'SYS',
    'ETN': 'ETN',
    'DGB': 'DGB',
    'XVG': 'XVG',
    'RDD': 'RDD',
    'MONA': 'MONA',
    'GAME': 'GAME',
    'NXS': 'NXS',
    'PPC': 'PPC',
    'NMC': 'NMC',
    'EMC': 'EMC',
    'GRS': 'GRS',
    'VTC': 'VTC',
    'VIA': 'VIA',
    'FLO': 'FLO',
    'BLK': 'BLK',
    'SIB': 'SIB',
    'ZCL': 'ZCL',
    'ZEN': 'ZEN',
    'XZC': 'XZC',
    'BCN': 'BCN',
    'MAID': 'MAID',
    'XCP': 'XCP',
    'NXT': 'NXT',
    'BURST': 'BURST',
    'QORA': 'QORA',
    'XPM': 'XPM',
    'FTC': 'FTC',
    'WDC': 'WDC',
    'DGC': 'DGC',
    'MEC': 'MEC',
    'QRK': 'QRK',
    'ZET': 'ZET',
    'YAC': 'YAC',
    'TRC': 'TRC',
    'IFC': 'IFC',
    'IXC': 'IXC',
    'NVC': 'NVC',
};

function translateTitle(title: string): string {
    // 1. Check exact match
    if (TRANSLATIONS[title]) return TRANSLATIONS[title];

    // 2. Check partial match (simple word replacement)
    let translated = title;
    for (const [eng, esp] of Object.entries(TRANSLATIONS)) {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, esp);
    }
    return translated;
}

async function main() {
    try {
        console.log('Starting migration...');

        // 1. WhatsApp Prompts
        console.log('Extracting WhatsApp Prompts...');
        const promptsData = await extractDataFromHtml(
            path.join(process.cwd(), 'public', 'WhatsApp Prompts 2025_v2.html'),
            'promptsData'
        ) as any[];

        if (!promptsData) throw new Error('Failed to extract promptsData');

        console.log(`Found ${promptsData.length} prompts.`);
        if (promptsData.length > 0) {
            console.log('Sample extracted prompt:', JSON.stringify(promptsData[0], null, 2));
        }

        for (const p of promptsData) {
            const titleEs = p.titleEs || translateTitle(p.title);

            if (p.id === 'fr-no-track') {
                console.log('Upserting fr-no-track with title_es:', titleEs);
            }

            await prisma.whatsappPrompt.upsert({
                where: { id: p.id },
                create: {
                    id: p.id,
                    title: p.title,
                    title_es: titleEs,
                    category: p.category,
                    code_impar_en: p.codeEn,
                    code_par_es: p.codeEs,
                    content_en: p.english,
                    content_es: p.spanish,
                    usage_count: 0,
                },
                update: {
                    title: p.title,
                    title_es: titleEs,
                    category: p.category,
                    code_impar_en: p.codeEn,
                    code_par_es: p.codeEs,
                    content_en: p.english,
                    content_es: p.spanish,
                }
            });
        }
        console.log('WhatsApp Prompts seeded.');

        // 2. Support Cases (MQA)
        console.log('Extracting Support Cases...');
        const flows = await extractDataFromHtml(
            path.join(process.cwd(), 'public', 'MQA Mind Map Quick Answer v9.5.html'),
            'flows'
        ) as any[];

        if (!flows) throw new Error('Failed to extract flows');

        console.log(`Found ${flows.length} cases.`);

        for (const f of flows) {
            let recommendedPromptId = null;

            // Heuristic Linking
            let bestMatch = null;
            let maxScore = 0;

            for (const p of promptsData) {
                let score = 0;
                const caseKeywords = (f.keywords || '').toLowerCase().split(' ');
                const promptText = (p.title + ' ' + p.english).toLowerCase();

                // Keyword matching
                for (const kw of caseKeywords) {
                    if (kw.length > 3 && promptText.includes(kw)) {
                        score += 1;
                    }
                }

                // Category bonus
                if (f.category === p.category) {
                    score += 2;
                }

                // Title matching (stronger)
                if (p.title.toLowerCase().includes(f.titleEn.toLowerCase())) {
                    score += 5;
                }

                if (score > maxScore && score > 3) { // Threshold
                    maxScore = score;
                    bestMatch = p.id;
                }
            }

            if (bestMatch) {
                recommendedPromptId = bestMatch;
                // console.log(`Linked Case ${f.id} to Prompt ${bestMatch} (Score: ${maxScore})`);
            }

            await prisma.supportCase.upsert({
                where: { id: f.id },
                create: {
                    id: f.id,
                    title_es: f.title,
                    title_en: f.titleEn || f.title,
                    category: f.category,
                    keywords: f.keywords,
                    condition: f.condition,
                    condition_en: f.conditionEn || null,
                    crm_code_type: f.crm?.type,
                    crm_complaint_status: f.crm?.complaint,
                    crm_detailed_type: f.crm?.detailed || null,
                    crm_remark_template: f.crm?.remark || (f.crm?.templates ? JSON.stringify(f.crm.templates) : null),
                    script_official_en: f.scriptEn || '',
                    script_official_es: f.scriptEs || '',
                    script_friendly_en: f.scriptEmpEn,
                    script_friendly_es: f.scriptEmpEs,
                    usage_count: 0,
                    recommendedPrompts: recommendedPromptId ? { connect: { id: recommendedPromptId } } : undefined,
                },
                update: {
                    title_es: f.title,
                    title_en: f.titleEn || f.title,
                    category: f.category,
                    keywords: f.keywords,
                    condition: f.condition,
                    condition_en: f.conditionEn || null,
                    crm_code_type: f.crm?.type,
                    crm_complaint_status: f.crm?.complaint,
                    crm_detailed_type: f.crm?.detailed || null,
                    crm_remark_template: f.crm?.remark || (f.crm?.templates ? JSON.stringify(f.crm.templates) : null),
                    script_official_en: f.scriptEn || '',
                    script_official_es: f.scriptEs || '',
                    script_friendly_en: f.scriptEmpEn,
                    script_friendly_es: f.scriptEmpEs,
                }
            });
        }
        console.log('Support Cases seeded.');

        // 3. Create Admin User
        console.log('Creating Admin User...');
        // Simple hash or plain text for MVP? 
        // Let's use plain text for now or simple hash if we had bcrypt. 
        // Assuming plain text for MVP speed, but in real app use bcrypt.
        await prisma.user.upsert({
            where: { email: 'admin@gofo.com' },
            create: {
                email: 'admin@gofo.com',
                password: '12345', // In production, hash this!
                role: 'admin',
                firstName: 'Admin',
                lastName: 'User'
            },
            update: {
                password: '12345'
            },
        });
        console.log('Admin User created (admin@gofo.com / 12345).');

        // 4. Create Agent User
        console.log('Creating Agent User...');
        await prisma.user.upsert({
            where: { email: 'agent@gofo.com' },
            create: {
                email: 'agent@gofo.com',
                password: '12345', // In production, hash this!
                role: 'agent',
                firstName: 'Agent',
                lastName: 'User'
            },
            update: {
                password: '12345'
            },
        });
        console.log('Agent User created (agent@gofo.com / 12345).');

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
