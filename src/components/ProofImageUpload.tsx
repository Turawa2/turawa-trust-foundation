import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToStorage, UploadResult } from '@/lib/storage';

interface ProofImage {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export interface ProofImageUploadRef {
  uploadAll: () => Promise<UploadResult[]>;
  getSelectedFiles: () => File[];
  hasImages: () => boolean;
  hasPendingUploads: () => boolean;
  reset: () => void;
}

interface ProofImageUploadProps {
  onImagesChange?: (images: UploadResult[]) => void;
  maxImages?: number;
}

const ProofImageUpload = forwardRef<ProofImageUploadRef, ProofImageUploadProps>(({
  onImagesChange,
  maxImages = 5,
}, ref) => {
  const [images, setImages] = useState<ProofImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    uploadAll: async () => {
      return await uploadAllImages();
    },
    getSelectedFiles: () => images.map(img => img.file),
    hasImages: () => images.length > 0,
    hasPendingUploads: () => images.some(img => !img.uploaded),
    reset: () => {
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      setUploadProgress({ current: 0, total: 0 });
    },
  }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages: ProofImage[] = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
    }));

    setImages(prev => [...prev, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const removed = next[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      next.splice(index, 1);
      return next;
    });
  };

  const uploadAllImages = async (): Promise<UploadResult[]> => {
    const pendingImages = images.filter(img => !img.uploaded);
    if (pendingImages.length === 0) {
      return images
        .filter(img => img.uploaded && img.url)
        .map(img => ({ url: img.url!, path: '' }));
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: pendingImages.length });

    const updatedImages = [...images];
    const uploadedResults: UploadResult[] = [];

    for (const img of updatedImages) {
      if (img.uploaded && img.url) {
        uploadedResults.push({ url: img.url, path: '' });
      }
    }

    let uploadedCount = 0;
    for (let i = 0; i < updatedImages.length; i++) {
      if (updatedImages[i].uploaded) continue;

      updatedImages[i] = { ...updatedImages[i], uploading: true };
      setImages([...updatedImages]);
      setUploadProgress({ current: uploadedCount + 1, total: pendingImages.length });

      try {
        const result = await uploadToStorage(updatedImages[i].file);
        updatedImages[i] = {
          ...updatedImages[i],
          uploading: false,
          uploaded: true,
          url: result.url,
        };
        uploadedResults.push(result);
        uploadedCount++;
      } catch (error) {
        updatedImages[i] = {
          ...updatedImages[i],
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
        setImages([...updatedImages]);
        setIsUploading(false);
        throw error;
      }

      setImages([...updatedImages]);
    }

    setIsUploading(false);
    onImagesChange?.(uploadedResults);
    return uploadedResults;
  };

  const allUploaded = images.length > 0 && images.every(img => img.uploaded);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground block">
        Proof Images (stored in Cloud)
      </label>

      {/* Upload Progress Bar */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Uploading to Cloud...
            </span>
            <span className="text-sm text-muted-foreground">
              {uploadProgress.current}/{uploadProgress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.preview}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden border border-border bg-secondary/50"
              >
                <img
                  src={image.preview}
                  alt={`Proof ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {image.uploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                
                {image.uploaded && (
                  <div className="absolute top-1 left-1">
                    <div className="bg-green-500 rounded-full p-0.5">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
                
                {image.error && (
                  <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                )}

                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
                  disabled={image.uploading}
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add button */}
      <div className="flex gap-2 items-center">
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
            disabled={isUploading}
          >
            <Image className="h-4 w-4" />
            {images.length === 0 ? 'Add Proof Images' : 'Add More'}
          </Button>
        )}

        {allUploaded && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            All images uploaded
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length}/{maxImages} images selected
          {images.some(img => img.uploaded) && ` • ${images.filter(img => img.uploaded).length} uploaded`}
        </p>
      )}
    </div>
  );
});

ProofImageUpload.displayName = 'ProofImageUpload';

export default ProofImageUpload;