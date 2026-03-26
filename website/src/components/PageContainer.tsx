import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
    /** Use 'narrow' for form/status pages (max-w-4xl centered inside the full-width container) */
    narrow?: boolean;
    /** Additional className for the outer wrapper */
    className?: string;
    /** Whether to include the gradient background (default: true) */
    withBackground?: boolean;
}

/**
 * Shared page container that enforces consistent layout across all pages.
 * - Consistent `max-w-7xl` outer width
 * - Consistent responsive padding: `px-4 sm:px-6 lg:px-8`
 * - Consistent vertical padding: `py-8`
 * - Optional gradient background
 */
export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    narrow = false,
    className = '',
    withBackground = true,
}) => {
    return (
        <div
            className={`min-h-screen ${withBackground ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : ''} relative ${className}`}
        >
            {/* Ambient background orbs */}
            {withBackground && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-violet-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-fuchsia-600/8 to-transparent rounded-full blur-3xl" />
                </div>
            )}

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {narrow ? (
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default PageContainer;
