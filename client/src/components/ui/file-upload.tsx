import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  className?: string;
  defaultUrl?: string;
  label?: string;
}

export function FileUpload({ onUploadComplete, accept = "image/*", className, defaultUrl, label }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size too large (max 50MB)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setPreview(data.url);
      onUploadComplete(data.url);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onUploadComplete("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      
      <div className="flex gap-4 items-center">
        {preview ? (
          <div className="relative group">
             {accept.startsWith("image") ? (
               <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-md border border-border" />
             ) : (
               <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-md border border-border">
                 <CheckCircle2 className="w-8 h-8 text-green-500" />
               </div>
             )}
             <button
               onClick={clearFile}
               type="button"
               className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
             >
               <X className="w-3 h-3" />
             </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="h-20 w-20 flex items-center justify-center bg-muted/50 hover:bg-muted rounded-md border-2 border-dashed border-border cursor-pointer transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        )}

        <div className="flex-1 space-y-2">
          <Input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="cursor-pointer"
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">
            Max size 50MB. {accept === "image/*" ? "JPG, PNG, WebP supported." : "Audio files supported."}
          </p>
        </div>
      </div>
    </div>
  );
}
