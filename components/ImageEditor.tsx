
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface ImageEditorProps {
  imageUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ImageEditor = forwardRef<{ clearMask: () => void }, ImageEditorProps>(({ imageUrl, canvasRef }, ref) => {
  const isDrawing = useRef(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  const BRUSH_SIZE = 40; // Diameter of the brush
  const BRUSH_COLOR = 'rgba(255, 255, 255, 0.7)';

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image && image.complete) {
      const { width, height } = image.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    }
  };

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.onload = resizeCanvas;
      window.addEventListener('resize', resizeCanvas);
    }
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (image) {
        image.onload = null;
      }
    };
  }, [imageUrl]);


  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event.nativeEvent) {
      clientX = event.nativeEvent.touches[0].clientX;
      clientY = event.nativeEvent.touches[0].clientY;
    } else {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(event);
    if (coords) {
        isDrawing.current = true;
        setLastPosition(coords);
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    
    event.preventDefault(); // Prevent scrolling on touch devices
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const currentPosition = getCoordinates(event);

    if (context && currentPosition && lastPosition) {
        context.beginPath();
        context.strokeStyle = BRUSH_COLOR;
        context.lineWidth = BRUSH_SIZE;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.moveTo(lastPosition.x, lastPosition.y);
        context.lineTo(currentPosition.x, currentPosition.y);
        context.stroke();
        setLastPosition(currentPosition);
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    setLastPosition(null);
  };
  
  const clearMask = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useImperativeHandle(ref, () => ({
    clearMask,
  }));

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Original upload"
        className="max-w-full max-h-full object-contain block"
        onLoad={resizeCanvas}
        crossOrigin="anonymous" 
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 right-0 bottom-0 m-auto cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
});

ImageEditor.displayName = 'ImageEditor';
