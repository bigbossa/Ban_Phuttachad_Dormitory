import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import axios from 'axios';

interface Tenant {
  id: string;
  image?: string | null;
}

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
}

const openFileInNewTab = (base64: string) => {
  const [prefix, content] = base64.split(',');
  const mime = prefix.match(/:(.*?);/)?.[1] || 'application/octet-stream';

  const byteString = atob(content);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mime });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

const FileGrid = ({
  files,
  onDelete,
}: {
  files: string[];
  onDelete: (index: number) => void;
}) => {
  return (
    <section className="file-list flex flex-wrap gap-4 mt-4">
      {files.map((file, i) => {
        const isImage = file.startsWith('data:image/');
        const isPDF = file.startsWith('data:application/pdf');

        return (
          <div
            key={i}
            className="relative file-item w-32 h-32 border rounded overflow-hidden flex items-center justify-center text-xs bg-gray-100 p-2"
          >
            <button
              onClick={() => onDelete(i)}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow text-red-500 hover:bg-red-100"
              title="ลบไฟล์"
            >
              <X size={14} />
            </button>

            {isImage ? (
              <div className="flex flex-col items-center">
                <img
                  src={file}
                  alt={`uploaded-${i}`}
                  className="object-cover w-full h-20 rounded"
                />
                <button
                  onClick={() => openFileInNewTab(file)}
                  className="text-blue-600 underline text-xs mt-2"
                >
                  ดูไฟล์
                </button>
              </div>
            ) : isPDF ? (
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-3xl select-none">📄</p>
                <button
                  onClick={() => openFileInNewTab(file)}
                  className="text-blue-600 underline text-xs mt-2"
                >
                  ดูไฟล์
                </button>
              </div>
            ) : (
              <p className="text-red-500 text-xs">ไม่รองรับ</p>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default function ContractImageDialog({
  open,
  onOpenChange,
  tenant,
}: ImageUploadDialogProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) setFiles([]);
  }, [open]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (e.target && typeof e.target.result === 'string') {
          setFiles((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDelete = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

 const handleUpload = async () => {
  if (!tenant?.id || files.length === 0) {
    alert('ไม่พบ tenant หรือ ไม่มีไฟล์');
    console.log('handleUpload: tenant หรือ files ว่าง', { tenant, files });
    return;
  }
  setUploading(true);

  console.log('handleUpload: กำลังส่งข้อมูล', {
    tenant_id: tenant.id,
    file_preview: files[0].slice(0, 30) + '...', 
  });

  try {
    const response = await axios.post('https://api-drombanput.onrender.com/server/insert_image', {
      tenant_id: tenant.id,
      image: files[0],
    });
    console.log('handleUpload: response จาก server', response.data);

    alert('อัปโหลดสำเร็จ');
    onOpenChange(false);
    setFiles([]);
  } catch (err) {
    console.error('handleUpload: เกิดข้อผิดพลาด', err);
    alert('เกิดข้อผิดพลาดในการอัปโหลด');
  } finally {
    setUploading(false);
  }
};


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
    onDrop,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>อัปโหลดรูปภาพ / สัญญาเช่า</DialogTitle>
        </DialogHeader>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-400 rounded p-6 text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>วางไฟล์ที่นี่...</p>
          ) : (
            <p>ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์ (ภาพหรือ PDF)</p>
          )}
        </div>

        <FileGrid files={files} onDelete={handleDelete} />

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
