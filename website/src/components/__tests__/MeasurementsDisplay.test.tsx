/**
 * MeasurementsDisplay Component Tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MeasurementsDisplay } from '../MeasurementsDisplay';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick, ...props }: any) => (
            <div className={className} onClick={onClick}>{children}</div>
        ),
        span: ({ children, ...props }: any) => <span>{children}</span>,
    },
}));

const mockMeasurements = {
    height: 175,
    chest_circumference: 100,
    waist_circumference: 80,
    hip_circumference: 98,
};

describe('MeasurementsDisplay', () => {
    it('renders with measurements', () => {
        render(<MeasurementsDisplay measurements={mockMeasurements} />);
        expect(screen.getByText(/All Measurements/i)).toBeInTheDocument();
    });

    it('displays measurement count', () => {
        render(<MeasurementsDisplay measurements={mockMeasurements} />);
        expect(screen.getByText(/4 measurements extracted/i)).toBeInTheDocument();
    });
});
