"use client";

import { useState, useCallback } from "react";
import UMLViewer from "@/components/UMLViewer";
import { UploadCloud, FileCode2, Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [umlData, setUmlData] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const javaFiles = Array.from(fileList).filter((f) => f.name.endsWith(".java"));
    setFiles((prev) => [...prev, ...javaFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    
    setIsGenerating(true);
    setError("");
    
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
         throw new Error("Failed to process Java files.");
      }

      const data = await response.json();
      
      if (data.error) {
          setError(data.error);
      } else if (data.mermaid) {
          setUmlData(data.mermaid);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(err);
      setError("An unexpected error occurred while communicating with the server.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans">
      <div className="max-w-6xl w-full flex flex-col gap-8">
        
        {/* Header Section */}
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Java to UML Generator</h1>
        </header>

        {/* Main Workspace */}
        <div className="flex flex-col lg:flex-row gap-6 h-[70vh]">
            
            {/* Sidebar / Upload Area */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                
                {/* Drag Drop Zone */}
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors duration-200 
                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
                >
                    <UploadCloud className={`mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} size={32} />
                    <p className="text-sm font-medium text-gray-700">Drag & drop Java files here</p>
                    <p className="text-xs text-gray-500 mt-1 mb-4">or click to browse</p>
                    
                    <label className="cursor-pointer bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                        Select Files
                        <input 
                            type="file" 
                            multiple 
                            accept=".java" 
                            className="hidden" 
                            onChange={handleFileInput}
                        />
                    </label>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto pr-2 mt-2">
                    {files.length > 0 ? (
                        <ul className="space-y-2">
                            {files.map((file, i) => (
                                <li key={i} className="flex flex-row items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-md text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileCode2 className="text-blue-600 min-w-4" size={16} />
                                        <span className="truncate text-gray-700">{file.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => removeFile(i)}
                                        className="text-gray-400 hover:text-red-500 transition-colors px-2"
                                        title="Remove"
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-gray-400">
                            No files selected.
                        </div>
                    )}
                </div>

                {/* Generate Button Context */}
                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600">
                        <AlertCircle className="shrink-0 mt-0.5" size={16} />
                        <span>{error}</span>
                    </div>
                )}
                
                <button 
                    onClick={handleGenerate}
                    disabled={files.length === 0 || isGenerating}
                    className={`mt-auto flex items-center justify-center w-full py-2.5 px-4 rounded-md font-medium text-white shadow-sm transition-all
                        ${files.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
                >
                    {isGenerating ? (
                        <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Generating...</span>
                    ) : (
                        "Generate UML"
                    )}
                </button>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 min-h-[400px] shadow-sm rounded-xl overflow-hidden bg-white border border-gray-200">
               <UMLViewer chartDefinition={umlData} />
            </div>
            
        </div>
      </div>
    </main>
  );
}
