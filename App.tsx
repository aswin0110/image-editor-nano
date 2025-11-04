
import React, { useState, useRef, useCallback } from 'react';
import { ImageEditor } from './components/ImageEditor';
import { editImage } from './services/geminiService';
import { UploadIcon, MagicWandIcon, ClearIcon } from './components/icons';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageEditorRef = useRef<{ clearMask: () => void }>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPEG, PNG, GIF, etc.).');
        return;
      }
      setError(null);
      setImageFile(file);
      setEditedImageUrl(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClearMask = useCallback(() => {
    imageEditorRef.current?.clearMask();
  }, []);

  const handleSubmit = async () => {
    if (!imageFile || !prompt.trim() || !canvasRef.current) {
      setError('Please upload an image, draw a mask, and enter a prompt.');
      return;
    }

    // Check if the mask is empty
    const context = canvasRef.current.getContext('2d');
    if (context) {
        const pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data.buffer
        );
        const isMaskEmpty = !pixelBuffer.some(color => color !== 0);
        if (isMaskEmpty) {
            setError('Please draw a mask on the area you want to edit.');
            return;
        }
    }


    setError(null);
    setIsLoading(true);
    setEditedImageUrl(null);

    try {
      const maskDataUrl = canvasRef.current.toDataURL('image/png');
      const resultImageUrl = await editImage(imageFile, maskDataUrl, prompt);
      setEditedImageUrl(resultImageUrl);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(e);
      setError(`Failed to edit image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Gemini Image Inpainter
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Edit images with AI by masking and prompting.
        </p>
      </header>

      <main className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        {/* Controls Panel */}
        <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-lg">
          <div>
            <label className="text-lg font-semibold text-gray-300 mb-2 block">1. Upload Image</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={triggerFileUpload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
              <UploadIcon />
              {imageFile ? 'Change Image' : 'Select Image'}
            </button>
            {imageFile && <p className="text-sm text-gray-400 mt-2 truncate">Selected: {imageFile.name}</p>}
          </div>

          <div>
             <label htmlFor="prompt" className="text-lg font-semibold text-gray-300 mb-2 block">2. Draw Mask & Describe Edit</label>
             <p className="text-sm text-gray-400 mb-3">Draw over the part of the image you want to change, then describe what you want.</p>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'add a pair of sunglasses' or 'make it a sunny day'"
              className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-200 placeholder-gray-500"
              disabled={!imageUrl}
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={handleClearMask}
              disabled={!imageUrl || isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClearIcon />
              Clear Mask
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !imageUrl || !prompt}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MagicWandIcon />
              {isLoading ? 'Generating...' : 'Apply Edit'}
            </button>
          </div>
          {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</p>}
        </aside>

        {/* Image Display Panel */}
        <section className="w-full lg:w-2/3 xl:w-3/4 flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center text-gray-300">Original</h2>
            <div className="aspect-square w-full bg-gray-800 rounded-xl shadow-lg flex items-center justify-center overflow-hidden relative">
              {imageUrl ? (
                <ImageEditor ref={imageEditorRef} imageUrl={imageUrl} canvasRef={canvasRef} />
              ) : (
                <div className="text-center text-gray-500">
                  <UploadIcon className="mx-auto h-12 w-12" />
                  <p>Upload an image to start</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center text-gray-300">Edited</h2>
            <div className="aspect-square w-full bg-gray-800 rounded-xl shadow-lg flex items-center justify-center overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20">
                  <div className="w-16 h-16 border-4 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-white">Gemini is thinking...</p>
                </div>
              )}
              {editedImageUrl ? (
                <img src={editedImageUrl} alt="Edited result" className="max-w-full max-h-full object-contain" />
              ) : (
                 <div className="text-center text-gray-500">
                   <MagicWandIcon className="mx-auto h-12 w-12" />
                  <p>Your edited image will appear here</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
