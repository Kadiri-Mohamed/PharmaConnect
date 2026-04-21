export default function FlashMessages({ flash = {}, status }) {
    const messages = [];

    if (status) {
        messages.push({ type: 'success', text: status });
    }

    if (flash.success) {
        messages.push({ type: 'success', text: flash.success });
    }

    if (flash.error) {
        messages.push({ type: 'error', text: flash.error });
    }

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {messages.map((message, index) => (
                <div
                    key={`${message.type}-${index}`}
                    className={`rounded-2xl border px-4 py-3 text-sm shadow-pharmacy ${
                        message.type === 'error'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-green-200 bg-green-50 text-green-700'
                    }`}
                >
                    {message.text}
                </div>
            ))}
        </div>
    );
}
