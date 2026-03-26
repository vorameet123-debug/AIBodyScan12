/**
 * ImageUpload Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImageUpload } from '../ImageUpload';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => <div className={className}>{children}</div>,
    },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    __esModule: true,
    default: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe('ImageUpload', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders upload component with label', () => {
        render(
            <ImageUpload
                label="Front Photo"
                value={null}
                onChange={mockOnChange}
            />
        );
        expect(screen.getByText(/Front Photo/i)).toBeInTheDocument();
    });

    it('shows drop instruction when no file', () => {
        render(
            <ImageUpload
                label="Test Upload"
                value={null}
                onChange={mockOnChange}
            />
        );
        expect(screen.getByText(/Drop image here/i)).toBeInTheDocument();
    });
});
