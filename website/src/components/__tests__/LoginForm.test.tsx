/**
 * LoginForm Component Tests
 * Tests user login form functionality
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

// Mock framer-motion
const filterMotionProps = (props: any) => {
    const {
        whileHover, whileTap, whileInView, initial, animate, exit, transition,
        variants, layout, layoutId, drag, dragConstraints, dragElastic,
        ...filteredProps
    } = props;
    return filteredProps;
};

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...filterMotionProps(props)}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...filterMotionProps(props)}>{children}</button>,
    },
}));

// Mock AuthService
jest.mock('../../services/auth', () => ({
    AuthService: {
        login: jest.fn(),
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

describe('LoginForm', () => {
    const mockOnSuccess = jest.fn();
    const mockOnSwitchToRegister = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders login form with email and password fields', () => {
            render(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
            );

            expect(screen.getByText(/email/i)).toBeInTheDocument();
            expect(screen.getByText(/password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        });

        it('renders welcome header', () => {
            render(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
            );

            expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
        });

        it('renders link to sign up', () => {
            render(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
            );

            expect(screen.getByText(/sign up/i)).toBeInTheDocument();
        });
    });

    describe('User Interaction', () => {
        it('allows typing in email field', async () => {
            const user = userEvent.setup();
            render(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
            );

            const emailInput = screen.getByPlaceholderText(/you@example.com/i);
            await user.type(emailInput, 'test@example.com');

            expect(emailInput).toHaveValue('test@example.com');
        });

        it('allows typing in password field', async () => {
            const user = userEvent.setup();
            render(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
            );

            const passwordInput = screen.getByPlaceholderText(/••••••••/);
            await user.type(passwordInput, 'password123');

            expect(passwordInput).toHaveValue('password123');
        });

        it('toggles password visibility', async () => {
            const user = userEvent.setup();
            render(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
            );

            const passwordInput = screen.getByPlaceholderText(/••••••••/);
            expect(passwordInput).toHaveAttribute('type', 'password');

            // Click toggle button (there should be an eye icon)
            const toggleButton = screen.getByRole('button', { name: '' });
            await user.click(toggleButton);

            expect(passwordInput).toHaveAttribute('type', 'text');
        });

        it('calls onSwitchToRegister when clicking sign up', async () => {
            const user = userEvent.setup();
            render(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
            );

            const signUpButton = screen.getByText(/sign up/i);
            await user.click(signUpButton);

            expect(mockOnSwitchToRegister).toHaveBeenCalled();
        });
    });

    describe('Form Submission', () => {
        it('shows error toast when submitting empty form', async () => {
            const user = userEvent.setup();
            const toast = require('react-hot-toast').default;

            render(
                <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
            );

            const submitButton = screen.getByRole('button', { name: /sign in/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Email and password are required');
            });
        });
    });
});
