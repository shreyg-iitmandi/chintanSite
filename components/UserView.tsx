import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { generateProductImage } from '../services/geminiService';
import { fileToBase64, getMimeType } from '../utils/fileUtils';
import Spinner from './Spinner';

interface UserViewProps {
  products: Product[];
}

const UserView: React.FC<UserViewProps> = ({ products }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [messageCardFile, setMessageCardFile] = useState<File | null>(null);
  const [messageCardPreview, setMessageCardPreview] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const handleMessageCardChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessageCardFile(file);
      const previewUrl = await fileToBase64(file);
      setMessageCardPreview(previewUrl);
    }
  };

  const handleGenerate = async () => {
    if (!selectedProduct || !messageCardFile) {
      setError("Please select a product and upload a message card.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const cardBase64 = await fileToBase64(messageCardFile);
      const cardMimeType = getMimeType(messageCardFile);

      const imagePromises = selectedProduct.mockups.map(async (mockup) => {
        const mockupBase64 = await fileToBase64(mockup.file);
        const mockupMimeType = getMimeType(mockup.file);
        return generateProductImage(mockupBase64, cardBase64, mockupMimeType, cardMimeType);
      });

      const results = await Promise.all(imagePromises);
      setGeneratedImages(results);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${selectedProduct?.name?.replace(/\s/g, '_')}_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Generate Product Images</h2>

      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col gap-6">
          
          <div>
            <label className="block mb-2 text-lg font-medium text-gray-300">Step 1: Select Product</label>
            {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {products.map(p => (
                        <div key={p.id} onClick={() => setSelectedProductId(p.id)} className={`cursor-pointer rounded-lg overflow-hidden border-4 ${selectedProductId === p.id ? 'border-blue-500' : 'border-transparent'} transition`}>
                           <img src={p.previewImageUrl} alt={p.name} className="w-full h-full object-cover aspect-square"/>
                           <p className={`text-center py-2 text-sm font-semibold ${selectedProductId === p.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>{p.name}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No products available. An admin needs to add them first.</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-lg font-medium text-gray-300">Step 2: Upload Message Card</label>
            <input type="file" accept="image/*" onChange={handleMessageCardChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
            {messageCardPreview && <img src={messageCardPreview} alt="Message Card Preview" className="mt-4 rounded-lg max-h-40" />}
          </div>
          <div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !selectedProductId || !messageCardFile}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Spinner size="5" />}
              {isLoading ? 'Generating...' : 'Step 3: Generate Images'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">{error}</div>}
      
      <div>
        <h3 className="text-2xl font-bold mb-4">Generated Images</h3>
        {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8 bg-gray-800 rounded-lg">
                <Spinner />
                <p className="text-lg">AI is working its magic... Please wait.</p>
                <p className="text-gray-400">This may take a minute depending on the number of images.</p>
            </div>
        )}
        {!isLoading && generatedImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {generatedImages.map((imgUrl, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg overflow-hidden group relative">
                        <img src={imgUrl} alt={`Generated ${index + 1}`} className="w-full h-auto object-contain aspect-square" />
                        <button onClick={() => handleDownload(imgUrl, index)} className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        )}
        {!isLoading && generatedImages.length === 0 && !error && (
             <div className="text-center p-8 bg-gray-800 rounded-lg">
                <p className="text-gray-400">Your generated images will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default UserView;