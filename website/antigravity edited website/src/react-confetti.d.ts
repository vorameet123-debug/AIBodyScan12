declare module 'react-confetti' {
    import React from 'react';

    export interface ConfettiProps {
        width?: number;
        height?: number;
        numberOfPieces?: number;
        recycle?: boolean;
        wind?: number;
        gravity?: number;
        initialVelocityX?: number;
        initialVelocityY?: number;
        colors?: string[];
        opacity?: number;
        onConfettiComplete?: (confetti?: any) => void;
        drawShape?: (ctx: CanvasRenderingContext2D) => void;
        tweenDuration?: number;
    }

    export default class Confetti extends React.Component<ConfettiProps> { }
}
