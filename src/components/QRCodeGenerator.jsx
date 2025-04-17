import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';

export default function QRCodeGenerator() {
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#000000');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('H');
  
  const qrRef = useRef(null);
  
  const downloadQRCode = () => {
    const svg = qrRef.current;
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'qrcode.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">QR Code Generator</h1>
      
      <div className="w-full flex flex-col md:flex-row gap-8">
        {/* Left Column - Controls */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="space-y-2">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="text"
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="4"
              placeholder="Enter URL or text"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
              Size: {size}px
            </label>
            <input
              id="size"
              type="range"
              min="128"
              max="512"
              step="8"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="fgColor" className="block text-sm font-medium text-gray-700">
                Foreground Color
              </label>
              <div className="flex items-center">
                <input
                  id="fgColor"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-500">{fgColor}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700">
                Background Color
              </label>
              <div className="flex items-center">
                <input
                  id="bgColor"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-500">{bgColor}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="errorLevel" className="block text-sm font-medium text-gray-700">
              Error Correction Level
            </label>
            <select
              id="errorLevel"
              value={errorCorrectionLevel}
              onChange={(e) => setErrorCorrectionLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              id="includeMargin"
              type="checkbox"
              checked={includeMargin}
              onChange={(e) => setIncludeMargin(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="includeMargin" className="ml-2 block text-sm text-gray-700">
              Include Margin
            </label>
          </div>
        </div>
        
        {/* Right Column - QR Code */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-lg shadow" style={{ maxWidth: '100%' }}>
            <QRCode
              ref={qrRef}
              value={text || " "}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level={errorCorrectionLevel}
              includeMargin={includeMargin}
            />
          </div>
          
          <button
            onClick={downloadQRCode}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download QR Code
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-600">
        <p>Tip: For best results scanning, use high contrast between foreground and background colors.</p>
      </div>
    </div>
  );
}