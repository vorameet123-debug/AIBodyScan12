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
      <label className="block text-sm font-semibold text-slate-200 mb-2">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>

      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? '#8b5cf6' : 'rgba(255, 255, 255, 0.15)',
          backgroundColor: isDragging ? 'rgba(139, 92, 246, 0.15)' : 'rgba(30, 41, 59, 0.5)',
        }}
        className="relative border-2 border-dashed border-white/15 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/10 backdrop-blur-sm"
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
                className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/25"
              >
                <Check size={28} />
              </motion.div>
            </div>
            <div>
              <p className="font-semibold text-white">{value.name}</p>
              <p className="text-sm text-slate-400 mt-1">
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onChange(null);
                toast.success('Image removed');
              }}
              className="text-sm text-violet-400 hover:text-violet-300 font-semibold mt-2 transition-colors"
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
                className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30"
              >
                <Upload size={24} className="text-violet-400" />
              </motion.div>
            </div>
            <div>
              <p className="font-semibold text-white">Drop image here</p>
              <p className="text-sm text-slate-400 mt-1">
                or click to browse
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
