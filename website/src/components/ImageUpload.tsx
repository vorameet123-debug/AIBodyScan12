import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onChange(file);
        toast.success(`${label} uploaded successfully!`);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onChange(file);
        toast.success(`${label} uploaded successfully!`);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? '#6366f1' : '#e2e8f0',
          backgroundColor: isDragging ? '#eef2ff' : '#ffffff',
        }}
        className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50/50"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {value ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white"
              >
                <Check size={28} />
              </motion.div>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{value.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onChange(null);
                toast.success('Image removed');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold mt-2"
            >
              Change Image
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center"
              >
                <Upload size={24} className="text-indigo-500" />
              </motion.div>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Drop image here</p>
              <p className="text-sm text-slate-500 mt-1">
                or click to browse
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
