'use client';

import React, { useEffect, useState } from 'react';
import { useAKC } from '@/context/AKCContext';
import { api } from '@/services/api';
import { MapPin, Phone, Clock, Calendar, MessageSquare, Copy, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PudoList({ embed = false }: { embed?: boolean }) {
    const { language, theme } = useAKC();
    const router = useRouter();
    const [locations, setLocations] = useState<any[]>([]);
    const [content, setContent] = useState<Record<string, { en: string, es: string }>>({});
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locs, cont] = await Promise.all([
                    api.pudo.list(),
                    api.pudo.getContent()
                ]);
                setLocations(locs);
                setContent(cont);
            } catch (error) {
                console.error('Failed to fetch PUDO data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const t = (key: string, en: string, es: string) => language === 'es' ? es : en;

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading P.U.D.O. info...</div>;
    }

    const intro = content['intro'] ? t('intro', content['intro'].en, content['intro'].es) : '';
    const footer = content['footer'] ? t('footer', content['footer'].en, content['footer'].es) : '';

    return (
        <div className={`max-w-7xl mx-auto ${embed ? 'mt-6' : 'px-4 py-8'}`}>
            {/* Aesthetic Banner */}
            <div className={`relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl mb-8 group isolate ${embed ? 'mt-0' : ''}`}>
                <img
                    src="/Pudo Banner.jpg"
                    alt="PUDO Banner"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 md:p-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
                            P.U.D.O. <span className="text-[#EF4D23]">LOCATIONS</span>
                        </h1>
                        <p className="text-gray-200 text-sm md:text-base font-medium max-w-2xl drop-shadow-md hidden md:block">
                            Pick Up & Drop Off Points - Find your nearest location for quick and easy package management.
                        </p>
                    </div>
                </div>
            </div>

            {/* Intro Text */}
            {intro && (
                <div className="mb-10 text-center">
                    <div className={`prose max-w-4xl mx-auto whitespace-pre-wrap text-base leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {intro}
                    </div>
                </div>
            )}

            {/* Locations Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12`}>
                {locations.map(loc => (
                    <div key={loc.id} className={`rounded-xl border p-6 flex flex-col h-full relative overflow-hidden transition-all hover:shadow-lg group ${theme === 'dark' ? 'bg-[#1B1F22] border-gray-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/20 text-[#EF4D23]">
                                <MapPin size={24} />
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${loc.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                                {loc.status}
                            </span>
                        </div>

                        <div className="flex items-start gap-2 mb-2 group/title cursor-pointer" onClick={() => copyToClipboard(loc.name, `name-${loc.id}`)}>
                            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{loc.name}</h3>
                            <span className={`opacity-0 group-hover/title:opacity-100 transition-opacity text-gray-400`}>
                                {copiedId === `name-${loc.id}` ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                            </span>
                        </div>

                        <div className="space-y-4 flex-1">
                            {/* Address */}
                            <div className={`text-sm flex items-start gap-2 group/addr cursor-pointer ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} onClick={() => copyToClipboard(loc.address, `addr-${loc.id}`)}>
                                <span className="mt-0.5"><MapPin size={14} className="opacity-70" /></span>
                                <span className="flex-1">{loc.address}</span>
                                <span className={`opacity-0 group-hover/addr:opacity-100 transition-opacity`}>
                                    {copiedId === `addr-${loc.id}` ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                                </span>
                            </div>

                            <div className={`text-xs p-3 rounded-lg space-y-2 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-slate-50'}`}>
                                {/* Business Days */}
                                <div className="flex items-center gap-2 group/days cursor-pointer" onClick={() => copyToClipboard(language === 'es' ? loc.businessDaysEs : loc.businessDaysEn, `days-${loc.id}`)}>
                                    <Calendar size={14} className="text-[#EF4D23]" />
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {language === 'es' ? loc.businessDaysEs : loc.businessDaysEn}
                                    </span>
                                    <span className={`opacity-0 group-hover/days:opacity-100 transition-opacity text-gray-400`}>
                                        {copiedId === `days-${loc.id}` ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                                    </span>
                                </div>
                                {/* Business Hours */}
                                <div className="flex items-center gap-2 group/hours cursor-pointer" onClick={() => copyToClipboard(loc.businessHours, `hours-${loc.id}`)}>
                                    <Clock size={14} className="text-[#EF4D23]" />
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {loc.businessHours}
                                    </span>
                                    <span className={`opacity-0 group-hover/hours:opacity-100 transition-opacity text-gray-400`}>
                                        {copiedId === `hours-${loc.id}` ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                                    </span>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className={`text-sm flex items-center gap-2 font-mono group/phone cursor-pointer ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`} onClick={() => copyToClipboard(loc.contact, `phone-${loc.id}`)}>
                                <Phone size={14} className="opacity-70" />
                                {loc.contact}
                                <span className={`opacity-0 group-hover/phone:opacity-100 transition-opacity text-gray-400`}>
                                    {copiedId === `phone-${loc.id}` ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                                </span>
                            </div>

                            {/* Zip Code */}
                            <div className={`text-sm flex items-center gap-2 group/zip cursor-pointer ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} onClick={() => copyToClipboard(loc.zipCode, `zip-${loc.id}`)}>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Zip Code:</span>
                                {loc.zipCode}
                                <span className={`opacity-0 group-hover/zip:opacity-100 transition-opacity text-gray-400`}>
                                    {copiedId === `zip-${loc.id}` ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                                </span>
                            </div>
                        </div>

                        {loc.whatsappPrompt && (
                            <button
                                onClick={() => router.push(`/prompts?id=${loc.whatsappPrompt.id}`)}
                                className="mt-6 w-full py-2 flex items-center justify-center gap-2 bg-[#EF4D23] hover:bg-[#d63f1a] text-white rounded-lg transition text-sm font-bold"
                            >
                                <MessageSquare size={16} />
                                {language === 'es' ? 'Ver Scripts WhatsApp' : 'View WhatsApp Scripts'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Content */}
            {footer && (
                <div className={`mt-12 pt-8 border-t text-center text-base leading-relaxed whitespace-pre-wrap max-w-4xl mx-auto ${theme === 'dark' ? 'border-gray-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                    {footer}
                </div>
            )}
        </div>
    );
}
