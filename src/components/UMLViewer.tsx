"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Download, ZoomIn, ZoomOut, Maximize, Image as ImageIcon } from 'lucide-react';

interface UMLViewerProps {
  chartDefinition: string;
}

const UMLViewer: React.FC<UMLViewerProps> = ({ chartDefinition }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      // Use standard font to prevent Mermaid from automatically aggressively fetching external Google Fonts
      fontFamily: 'sans-serif',
      // Disable html labels to prevent foreignObject tags which heavily taint HTML Canvas conversions
      htmlLabels: false,
      class: {
          useMaxWidth: false,
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      if (!chartDefinition) {
        setSvgContent('');
        return;
      }
      
      try {
        setError(null);
        // Add a random ID to prevent caching issues if the same chart is toggled
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chartDefinition);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Error rendering UML graph.';
        console.error("Mermaid rendering error:", err);
        if (isMounted) {
            setError(errMessage);
            setSvgContent('');
        }
      }
    };

    renderChart();
    
    return () => { isMounted = false; };
  }, [chartDefinition]);

  const handleDownloadSVG = () => {
      if (!svgContent) return;
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'uml_diagram.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
      if (!svgContent || !containerRef.current) return;
      
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) return;

      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Ensure the SVG has explicit width and height derived from its viewBox
      const viewBox = clonedSvg.getAttribute('viewBox');
      if (viewBox) {
          const parts = viewBox.split(' ');
          if (parts.length === 4) {
              clonedSvg.setAttribute('width', parts[2]);
              clonedSvg.setAttribute('height', parts[3]);
              clonedSvg.style.width = parts[2] + 'px';
              clonedSvg.style.height = parts[3] + 'px';
              clonedSvg.style.maxWidth = 'none';
          }
      }

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      // Remove any external stylesheets/fonts from the SVG to prevent the browser from tainting the canvas
      let safeSvgData = svgData.replace(/@import url\([^)]+\);?/gi, '');
      safeSvgData = safeSvgData.replace(/<img[^>]*>/gi, ''); // Explicitly strip imgs
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      const blob = new Blob([safeSvgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
          // Increase resolution for crisper image
          const scale = 2;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          if (ctx) {
              ctx.scale(scale, scale);
              ctx.fillStyle = "white"; // Add white background as default transparency makes text hard to read in some viewers
              ctx.fillRect(0, 0, img.width, img.height);
              ctx.drawImage(img, 0, 0);
          }
          
          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = "uml_diagram.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      };
      img.src = url;
  };

  if (!chartDefinition) {
      return (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
              Upload Java source code to generate a UML diagram.
          </div>
      );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white border border-gray-200 rounded-lg">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
                onClick={handleDownloadSVG}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-md hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                title="Download SVG"
            >
                <Download size={16} /> SVG
            </button>
            <button 
                onClick={handleDownloadPNG}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-md hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                title="Download PNG"
            >
                <ImageIcon size={16} /> PNG
            </button>
        </div>

        {error ? (
          <div className="flex h-full items-center justify-center p-4 text-red-500 bg-red-50">
             <div className="max-w-md text-sm">{error}</div>
          </div>
        ) : (
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={4}
            centerOnInit={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <React.Fragment>
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-white p-1 rounded-md shadow-sm border border-gray-200">
                   <button onClick={() => zoomIn()} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Zoom In"><ZoomIn size={18}/></button>
                   <button onClick={() => zoomOut()} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Zoom Out"><ZoomOut size={18}/></button>
                   <button onClick={() => resetTransform()} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Reset"><Maximize size={18}/></button>
                </div>
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center p-8">
                  <div 
                    ref={containerRef}
                    className="mermaid flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                </TransformComponent>
              </React.Fragment>
            )}
          </TransformWrapper>
        )}
    </div>
  );
};

export default UMLViewer;
