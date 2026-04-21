import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

const quickPrompts = [
    'What is paracetamol usually used for?',
    'Do I usually need a prescription for amoxicillin?',
    'What should I ask a pharmacist before taking ibuprofen?',
];

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY?.trim() ?? '';
const groqBaseUrl =
    import.meta.env.VITE_GROQ_BASE_URL?.trim().replace(/\/+$/, '') || 'https://api.groq.com/openai/v1';
const groqModel = import.meta.env.VITE_GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';

const createMessage = (role, content, extra = {}) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    ...extra,
});

const extractPageMedicaments = (pageProps) => {
    const items = Array.isArray(pageProps?.medicaments) ? pageProps.medicaments : [];
    const fallbackPharmacyName = pageProps?.pharmacy?.name ?? null;

    return items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || 'No description provided.',
        stock: Number(item.stock ?? 0),
        priceLabel:
            item.price === undefined || item.price === null ? null : `${Number(item.price).toFixed(2)} MAD`,
        requiresPrescription: Boolean(item.requires_prescription),
        pharmacyName: item.pharmacy?.name || fallbackPharmacyName,
    }));
};

const buildWelcomeMessage = (medicamentCount) => ({
    id: 'assistant-welcome',
    role: 'assistant',
    content:
        medicamentCount > 0
            ? `Hi, I can answer general medicine questions and use the ${medicamentCount} medicaments visible on this page as local context. I do not replace a pharmacist or doctor.`
            : 'Hi, I can answer general medicine questions. I do not replace a pharmacist or doctor.',
    relatedMedicaments: [],
});

const findRelevantMedicaments = (question, medicaments) => {
    const keywords = question
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((keyword) => keyword.length >= 3);

    if (keywords.length === 0) {
        return [];
    }

    return medicaments
        .filter((item) => {
            const haystack = `${item.name} ${item.description} ${item.pharmacyName || ''}`.toLowerCase();
            return keywords.some((keyword) => haystack.includes(keyword));
        })
        .slice(0, 4);
};

const buildSystemPrompt = (relatedMedicaments, currentPageMedicamentsCount) => {
    const catalogContext =
        relatedMedicaments.length === 0
            ? currentPageMedicamentsCount > 0
                ? 'Current page catalog context: medicaments are loaded on this page, but none clearly match the current question.'
                : 'Current page catalog context: none available.'
            : `Current page catalog context:\n${relatedMedicaments
                  .map((item) =>
                      [
                          `Name: ${item.name}`,
                          item.pharmacyName ? `Pharmacy: ${item.pharmacyName}` : null,
                          item.priceLabel ? `Price: ${item.priceLabel}` : null,
                          `Stock: ${item.stock}`,
                          `Prescription: ${item.requiresPrescription ? 'required' : 'not required'}`,
                          `Description: ${item.description}`,
                      ]
                          .filter(Boolean)
                          .join(' | '),
                  )
                  .join('\n')}`;

    return [
        'You are a medicine assistant inside a pharmacy web application.',
        'Answer in the same language as the user when possible.',
        'You can explain general medicine information and use the provided current-page catalog context when it is available.',
        'Do not diagnose illnesses, prescribe treatment, or give dosage instructions.',
        'If the user asks about pregnancy, allergies, children, interactions, personal treatment decisions, or emergencies, tell them to speak with a licensed pharmacist or doctor.',
        'If the user mentions severe symptoms, overdose, breathing trouble, chest pain, or allergic reactions, tell them to seek urgent medical care immediately.',
        'When catalog context is provided, treat it as the source of truth for stock, price, and prescription status on the current page.',
        'Keep answers short, practical, and easy to understand.',
        catalogContext,
    ].join('\n\n');
};

export default function MedicineAssistant() {
    const page = usePage();
    const currentMedicaments = extractPageMedicaments(page.props);
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([buildWelcomeMessage(currentMedicaments.length)]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesRef = useRef(null);
    const isEnabled = groqApiKey !== '';

    useEffect(() => {
        if (!messagesRef.current) {
            return;
        }

        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages, isLoading, isOpen]);

    if (!isEnabled) {
        return null;
    }

    const submitPrompt = async (prompt) => {
        const cleanedPrompt = prompt.trim();

        if (!cleanedPrompt || isLoading) {
            return;
        }

        const userMessage = createMessage('user', cleanedPrompt);
        const pendingMessages = [...messages, userMessage];
        const relatedMedicaments = findRelevantMedicaments(cleanedPrompt, currentMedicaments);

        setMessages(pendingMessages);
        setInput('');
        setError('');
        setIsLoading(true);
        setIsOpen(true);

        try {
            const response = await fetch(`${groqBaseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: groqModel,
                    messages: [
                        {
                            role: 'system',
                            content: buildSystemPrompt(relatedMedicaments, currentMedicaments.length),
                        },
                        ...pendingMessages.slice(-8).map(({ role, content }) => ({ role, content })),
                    ],
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.error?.message || 'The medicine assistant is unavailable right now.');
            }

            const reply = payload.choices?.[0]?.message?.content?.trim();

            if (!reply) {
                throw new Error('The medicine assistant returned an empty response.');
            }

            setMessages([
                ...pendingMessages,
                createMessage('assistant', reply, {
                    relatedMedicaments,
                }),
            ]);
        } catch (requestError) {
            setMessages([
                ...pendingMessages,
                createMessage(
                    'assistant',
                    'I could not reach the medicine assistant right now. Please try again in a moment.',
                ),
            ]);
            setError(
                requestError.message ||
                    'The request failed. If it keeps happening, check the browser network tab for API or CORS errors.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        submitPrompt(input);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
            {isOpen && (
                <section className="w-[min(27rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-pharmacy-light/80 bg-white/95 shadow-[0_26px_70px_rgba(15,23,42,0.22)] backdrop-blur-xl">
                    <div className="border-b border-pharmacy-light/70 bg-gradient-to-r from-pharmacy-deepest via-pharmacy-dark to-pharmacy-medium px-5 py-4 text-white">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pharmacy-light/80">
                                    Medicine Help
                                </p>
                                <h2 className="mt-2 text-lg font-semibold">Pharma Assistant</h2>
                                <p className="mt-1 text-sm text-white/80">
                                    Ask about medicines. On medicament pages, the assistant also uses the current page
                                    catalog as context.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div ref={messagesRef} className="max-h-[27rem] space-y-3 overflow-y-auto px-4 py-4">
                        {messages.map((message) => {
                            const isAssistant = message.role === 'assistant';

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                            isAssistant
                                                ? 'border border-pharmacy-light/80 bg-white text-slate-700'
                                                : 'bg-pharmacy-dark text-white'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>

                                        {isAssistant && message.relatedMedicaments?.length > 0 && (
                                            <div className="mt-3 grid gap-2">
                                                {message.relatedMedicaments.map((item) => (
                                                    <div
                                                        key={`${message.id}-${item.id}`}
                                                        className="rounded-xl border border-pharmacy-light/70 bg-pharmacy-light/10 p-3"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-pharmacy-deepest">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {item.pharmacyName || 'Pharmacy unavailable'}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`status-badge ${
                                                                    item.stock > 0
                                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                        : 'border-slate-200 bg-slate-100 text-slate-500'
                                                                }`}
                                                            >
                                                                {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                                                            </span>
                                                        </div>

                                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                                                            {item.priceLabel && (
                                                                <span className="rounded-full border border-pharmacy-light/70 bg-white px-2.5 py-1 font-semibold text-pharmacy-dark">
                                                                    {item.priceLabel}
                                                                </span>
                                                            )}
                                                            <span className="rounded-full border border-pharmacy-light/70 bg-white px-2.5 py-1">
                                                                {item.requiresPrescription
                                                                    ? 'Prescription required'
                                                                    : 'No prescription needed'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl border border-pharmacy-light/80 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                                    The assistant is thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-pharmacy-light/70 bg-slate-50/85 px-4 py-4">
                        {error && (
                            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        {messages.length === 1 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {quickPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => submitPrompt(prompt)}
                                        className="rounded-full border border-pharmacy-light/80 bg-white px-3 py-1.5 text-xs font-semibold text-pharmacy-dark transition hover:border-pharmacy-medium hover:bg-pharmacy-light/20"
                                        disabled={isLoading}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <label
                                htmlFor="medicine-assistant-input"
                                className="block text-sm font-semibold text-pharmacy-deepest"
                            >
                                Ask about a medicine
                            </label>
                            <textarea
                                id="medicine-assistant-input"
                                rows={3}
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        submitPrompt(input);
                                    }
                                }}
                                placeholder="Example: What is paracetamol used for?"
                                className="form-input mt-0 resize-none"
                                disabled={isLoading}
                            />

                            <div className="flex items-center justify-between gap-3">
                                <p className="max-w-xs text-xs leading-5 text-slate-500">
                                    Informational only. For diagnosis, dosage, or emergencies, contact a pharmacist,
                                    doctor, or emergency services.
                                </p>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isLoading || input.trim() === ''}
                                >
                                    {isLoading ? 'Thinking...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="group flex items-center gap-3 rounded-full bg-pharmacy-deepest px-4 py-3 text-left text-white shadow-[0_18px_45px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-pharmacy-dark"
            >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-pharmacy-light/35 bg-pharmacy-light/15 text-sm font-bold text-pharmacy-light">
                    Rx
                </span>
                <span>
                    <span className="block text-sm font-semibold">Medicine Assistant</span>
                    <span className="block text-xs text-pharmacy-light/75">
                        {isOpen ? 'Hide chat' : 'Ask about medicines'}
                    </span>
                </span>
            </button>
        </div>
    );
}
