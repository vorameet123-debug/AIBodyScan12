import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning';
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    variant = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Handle ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel]);

    // Focus management
    useEffect(() => {
        if (isOpen) {
            // Store current focus
            previousFocusRef.current = document.activeElement as HTMLElement;

            // Focus first button in modal
            setTimeout(() => {
                const firstButton = modalRef.current?.querySelector('button');
                firstButton?.focus();
            }, 100);
        } else {
            // Restore focus when modal closes
            previousFocusRef.current?.focus();
        }
    }, [isOpen]);

    const Icon = variant === 'danger' ? AlertTriangle : AlertCircle;
    const iconColor = variant === 'danger' ? 'text-rose-500' : 'text-amber-500';
    const iconBg = variant === 'danger' ? 'bg-rose-500/10' : 'bg-amber-500/10';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onCancel}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-slate-900 rounded-2xl shadow-bento max-w-md w-full overflow-hidden border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                        ref={modalRef}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-start gap-4">
                                <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
                                    <Icon className={iconColor} size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 id="modal-title" className="text-xl font-bold text-white mb-1">{title}</h3>
                                    <p id="modal-description" className="text-slate-400 text-sm">{message}</p>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                                    aria-label="Close dialog"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-slate-800/50 flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={onCancel}
                                className="flex-1"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant={variant === 'danger' ? 'danger' : 'primary'}
                                onClick={() => {
                                    onConfirm();
                                    onCancel();
                                }}
                                className="flex-1"
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
