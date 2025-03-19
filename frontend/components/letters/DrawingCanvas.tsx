'use client';

import { useRef, useState, useEffect } from 'react';
import { Eraser, Paintbrush, Undo2, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrawingCanvasProps {
    onSave: (dataUrl: string) => void;
}

export function DrawingCanvas({ onSave }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(5);
    const [mode, setMode] = useState<'brush' | 'eraser'>('brush');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas dimensions
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Set initial canvas state
        context.fillStyle = '#0a0a23';
        context.fillRect(0, 0, canvas.width, canvas.height);

        setCtx(context);

        // Save initial state to history
        const initialState = canvas.toDataURL();
        setHistory([initialState]);
        setHistoryIndex(0);

        // Handle window resize
        const handleResize = () => {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            context.fillStyle = '#0a0a23';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.putImageData(imageData, 0, 0);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Save current state to history
    const saveToHistory = () => {
        if (!canvasRef.current) return;

        const dataUrl = canvasRef.current.toDataURL();

        // Only save if different from last state
        if (history[historyIndex] !== dataUrl) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(dataUrl);

            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    };

    // Undo last action
    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);

            const canvas = canvasRef.current;
            if (!canvas || !ctx) return;

            const img = new Image();
            img.src = history[newIndex];
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    };

    // Clear canvas
    const handleClear = () => {
        if (!canvasRef.current || !ctx) return;

        ctx.fillStyle = '#0a0a23';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        saveToHistory();
    };

    // Save drawing
    const handleSave = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL();
        onSave(dataUrl);
    };

    // Drawing functions
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!ctx) return;

        setIsDrawing(true);

        const canvas = canvasRef.current;
        if (!canvas) return;

        let x, y;

        if ('touches' in e) {
            // Touch event
            const rect = canvas.getBoundingClientRect();
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            // Mouse event
            x = e.nativeEvent.offsetX;
            y = e.nativeEvent.offsetY;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Set drawing style
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (mode === 'brush') {
            ctx.strokeStyle = color;
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.strokeStyle = '#0a0a23';
            ctx.globalCompositeOperation = 'destination-out';
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !ctx || !canvasRef.current) return;

        let x, y;

        if ('touches' in e) {
            // Touch event
            const rect = canvasRef.current.getBoundingClientRect();
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            // Mouse event
            x = e.nativeEvent.offsetX;
            y = e.nativeEvent.offsetY;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            if (ctx) {
                ctx.closePath();
                saveToHistory();
            }
        }
    };

    // Color options
    const colorOptions = [
        '#ffffff', // white
        '#ff66c4', // nebula pink
        '#6e44ff', // nebula purple
        '#4285f4', // nebula blue
        '#36bfb1', // nebula teal
        '#ff9e44', // nebula orange
    ];

    return (
        <div className="drawing-container">
            <div className="drawing-canvas-wrapper">
                <canvas
                    ref={canvasRef}
                    className="drawing-canvas"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            <div className="drawing-controls">
                <div className="drawing-tools">
                    <Button
                        type="button"
                        variant={mode === 'brush' ? 'primary' : 'outline'}
                        size="icon"
                        onClick={() => setMode('brush')}
                        className={mode === 'brush' ? 'active-tool' : ''}
                    >
                        <Paintbrush className="icon-small" />
                    </Button>

                    <Button
                        type="button"
                        variant={mode === 'eraser' ? 'primary' : 'outline'}
                        size="icon"
                        onClick={() => setMode('eraser')}
                        className={mode === 'eraser' ? 'active-tool' : ''}
                    >
                        <Eraser className="icon-small" />
                    </Button>

                    <div className="color-picker">
                        {colorOptions.map((c) => (
                            <button
                                key={c}
                                type="button"
                                className={`color-option ${color === c ? 'color-active' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>

                <div className="drawing-actions">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                    >
                        <Undo2 className="icon-small" />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleClear}
                    >
                        <Trash2 className="icon-small" />
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSave}
                    >
                        <Download className="icon-small icon-left" />
                        Save Drawing
                    </Button>
                </div>
            </div>

            <div className="brush-size-control">
                <span className="brush-size-label">Brush Size:</span>
                <input
                    type="range"
                    min="1"
                    max="30"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="brush-size-slider"
                />
                <span className="brush-size-value">{brushSize}px</span>
            </div>
        </div>
    );
} 