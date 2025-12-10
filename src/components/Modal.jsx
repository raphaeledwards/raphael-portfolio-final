import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const closeButtonRef = React.useRef(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setTimeout(() => {
                setIsVisible(true);
                // Simple focus trap: focus close button on open for accessibility
                if (closeButtonRef.current) closeButtonRef.current.focus();
            }, 10); // Trigger animation
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300); // Wait for animation
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/80 backdrop-blur-sm opacity-100' : 'bg-black/0 opacity-0 pointer-events-none'}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`bg-neutral-900 border border-neutral-800 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col transition-all duration-300 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <h2 id="modal-title" className="text-xl font-bold text-white pr-8">{title}</h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 rounded p-1"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto text-neutral-300 leading-relaxed space-y-4">
                    {children}
                </div>

                {/* Footer (Optional, could just be padding) */}
                <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-bold text-sm transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
