import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export function ShareButtons({ setShareModalOpen }) {
    const [copied, setCopied] = useState(false);
    const currentUrl = window.location.href;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setTimeout(() => {
                setShareModalOpen((prev) => !prev);
            }, 1000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };
    const shareOnWhatsApp = () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(currentUrl)}`;
        window.open(whatsappUrl, "_blank");
        setTimeout(() => {
            setShareModalOpen((prev) => !prev);
        }, 1000);
    };

    return (
        <div className="flex gap-2 z-50">
            <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
                aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
            >
                {copied ? (
                    <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 text-sm sm:text-base md:text-lg">¡Copiado!</span>
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm sm:text-base md:text-lg">Copiar URL</span>
                    </>
                )}
            </button>

            <button
                onClick={shareOnWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blueRemax text-white rounded-lg shadow-sm hover:bg-blueRemax/80 transition-colors duration-200"
                aria-label="Share on WhatsApp"
            >
                <Share2 className="w-4 h-4" />
                <span className="text-sm sm:text-base md:text-lg">Compartir en WhatsApp</span>
            </button>
        </div>
    );
}
