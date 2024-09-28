"use client";
import React, { useState } from "react";

interface FileUploadProps {
    onFileRead: (content: any) => void;
  }

interface ObjectDownloadProps {
    object: any;
    fileName: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileRead }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setSelectedFile(file || null);
  
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const content = e.target.result as string;
            try {
              const parsedObject = JSON.parse(content);
              onFileRead(parsedObject);
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          }
        };
        reader.readAsText(file);
      }
    };
  
    return (
      <div>
        <input type="file" onChange={handleFileChange} />
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      </div>
    );
  };

export const ObjectDownload: React.FC<ObjectDownloadProps> = ({
    object,
    fileName,
}) => {
    const handleDownload = async () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(object)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${fileName}.json`;
        link.click();
    };

    return <button onClick={handleDownload}>Download</button>;
};
