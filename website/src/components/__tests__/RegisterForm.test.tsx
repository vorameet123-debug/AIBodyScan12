/**
 * RegisterForm Component Tests
 * Tests user registration form functionality
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../RegisterForm';

// Filter motion props
const filterMotionProps = (props: any) => {
    const {
        whileHover, whileTap, whileInView, initial, animate, exit, transition,
        variants, layout, layoutId, drag, dragConstraints, dragElastic,
        ...filteredProps
    } = props;
    return filteredProps;
};

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...filterMotionProps(props)}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...filterMotionProps(props)}>{children}</button>,
    },
}));

// Mock AuthService
jest.mock('../../services/auth', () => ({
    AuthService: {
        register: jest.fn(),
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

describe('RegisterForm', () => {
    const mockOnSuccess = jest.fn();
    const mockOnSwitchToLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders registration form with email input', () => {
            render(
                <RegisterForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />
            );

            expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        });

        it('renders password input', () => {
            render(
                <RegisterForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />
            );

            expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
        });

        it('renders submit button', () => {
            render(
                <RegisterForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />
            );

            expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
        });
    });

    describe('User Interaction', () => {
        it('allows typing in email field', async () => {
            const user = userEvent.setup();
            render(
                <RegisterForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />
            );

            const emailInput = screen.getByPlaceholderText(/you@example.com/i);
            await user.type(emailInput, 'test@example.com');

            expect(emailInput).toHaveValue('test@example.com');
        });

        it('calls onSwitchToLogin when clicking sign in link', async () => {
            const user = userEvent.setup();
            render(
                <RegisterForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />
            );

            // Find by role button with text Sign In
            const signInButtons = screen.getAllByRole('button');
            const signInButton = signInButtons.find(btn => btn.textContent?.toLowerCase().includes('sign in'));
            if (signInButton) {
                await user.click(signInButton);
                expect(mockOnSwitchToLogin).toHaveBeenCalled();
            }
        });
    });

    describe('Form Submission', () => {
        it('shows error when submitting with empty email', async () => {
            const user = userEvent.setup();
            const toast = require('react-hot-toast').default;

            render(
                <RegisterForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />
            );

            const submitButton = screen.getByRole('button', { name: /create account/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Email and password are required');
            });
        });
    });
});
