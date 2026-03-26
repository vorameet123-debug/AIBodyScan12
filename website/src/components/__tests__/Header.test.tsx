/**
 * Header Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => <div className={className}>{children}</div>,
        header: ({ children, ...props }: any) => <header>{children}</header>,
    },
}));

describe('Header', () => {
    it('renders the header component', () => {
        render(<Header />);

        expect(screen.getByText(/BodyScan AI/i)).toBeInTheDocument();
    });

    it('shows the tagline', () => {
        render(<Header />);

        expect(screen.getByText(/3D Body Intelligence/i)).toBeInTheDocument();
    });
});
