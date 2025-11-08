"use client";

import type React from "react";

import { useState } from "react";
import { FileUp, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ingestData } from "@/server-action/file.upload.server";
import { UploadDataItem } from "@/types/upload-data-item";
import { useAuth } from "@clerk/nextjs";
import { DataType } from "@prisma/client";
import { showToast } from "nextjs-toast-notify";


interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export function FileUploadModal({
  isOpen,
  onClose,
  onSubmit,
}: FileUploadModalProps) {
  const [formData, setFormData] = useState<UploadDataItem>(() => {
    return {
      url: "",
      text: "",
      file: undefined,
      pdf_strategy: "auto",
      sitemap: false,
      source_label: "",
      chunk_size: 1200,
      chunk_overlap: 120,
      store_mode: "permanent",
      session_id: "",
      namespace: "",
    };
  });
  const [dataType, setDataType] = useState<DataType>(DataType.DOCUMENT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const { userId } = useAuth();

  const handleChange = (
    field: keyof UploadDataItem,
    value: string | File | boolean | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file as unknown as UploadDataItem["file"],
      }));
      setFileName(file.name);
      if (errors.file) {
        setErrors((prev) => ({
          ...prev,
          file: "",
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (dataType === DataType.DOCUMENT || dataType === DataType.IMAGE) {
      if (!formData.file) {
        newErrors.file = `Please select a ${
          dataType === DataType.DOCUMENT ? "PDF" : "Image"
        } file`;
      }
    }
    if (dataType === DataType.TEXT) {
      if (!formData.text || !formData.text.trim()) {
        newErrors.text = "Text is required";
      }
    }
    if (dataType === DataType.URL) {
      if (!formData.url || !formData.url.trim()) {
        newErrors.url = "URL is required";
      }
    }

    if (!formData.source_label.trim()) {
      newErrors.source_label = "Name is required";
    }

    if (dataType === DataType.DOCUMENT && !formData.pdf_strategy) {
      newErrors.pdf_strategy = "Strategy is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    if (!userId) {
      throw new Error("User not found");
    }
    try {
      setIsSubmitting(true);
      const base = {
        pdf_strategy: formData.pdf_strategy,
        sitemap: formData.sitemap,
        source_label: formData.source_label,
        chunk_size: formData.chunk_size,
        chunk_overlap: formData.chunk_overlap,
        store_mode: formData.store_mode,
        session_id: `${userId}`,
        namespace: `user-${userId}`,
      } as UploadDataItem;

      let payload: UploadDataItem = base;
      if (dataType === DataType.DOCUMENT || dataType === DataType.IMAGE) {
        payload = { ...base, file: formData.file };
      } else if (dataType === DataType.TEXT) {
        payload = { ...base, text: (formData.text ?? "").trim() };
      } else if (dataType === DataType.URL) {
        payload = { ...base, url: (formData.url ?? "").trim() };
      }

      
      await ingestData(payload, userId, dataType);
      showToast.success("Upload successful", {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });
      onClose();
    } catch (error) {
      console.error(error);
      showToast.error("Upload failed. Please try again."+error, {
        duration: 4000,
        progress: true,
        position: "top-right",
        transition: "bounceIn",
        icon: '',
        sound: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Data Type Selector */}
          <div
            className="flex items-center gap-2 justify-start
          "
          >
            <div className="space-y-2">
              <Label
                htmlFor="file-type"
                className="text-sm font-medium text-slate-700"
              >
                Type
              </Label>
              <Select
                value={dataType}
                onValueChange={(value) => {
                  const nextType = value as DataType;
                  setDataType(nextType);
                  // enforce mutual exclusivity
                  setFormData((prev) => ({
                    ...prev,
                    file:
                      nextType === DataType.DOCUMENT ||
                      nextType === DataType.IMAGE
                        ? prev.file
                        : undefined,
                    text:
                      nextType === DataType.TEXT ? prev.text ?? "" : undefined,
                    url: nextType === DataType.URL ? prev.url ?? "" : undefined,
                  }));
                  setErrors({});
                  if (
                    !(
                      nextType === DataType.DOCUMENT ||
                      nextType === DataType.IMAGE
                    )
                  ) {
                    setFileName("");
                  }
                }}
              >
                <SelectTrigger id="file-type" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DataType.DOCUMENT}>Document</SelectItem>
                  <SelectItem value={DataType.IMAGE}>Image</SelectItem>
                  <SelectItem value={DataType.TEXT}>Text</SelectItem>
                  <SelectItem value={DataType.URL}>Web URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dataType === DataType.DOCUMENT && (
              <div className="space-y-2">
                <Label
                  htmlFor="pdf-strategy"
                  className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
                >
                  <Settings2 className="w-4 h-4" />
                  Strategy
                </Label>
                <Select
                  value={formData.pdf_strategy}
                  onValueChange={(value) => handleChange("pdf_strategy", value)}
                >
                  <SelectTrigger id="pdf-strategy" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="text">Text First</SelectItem>
                    <SelectItem value="table">Table First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {dataType === DataType.DOCUMENT || dataType === DataType.IMAGE ? (
            <div className="space-y-2">
              <Label
                htmlFor="file-upload"
                className="text-sm font-medium text-slate-700"
              >
                File
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept={
                    dataType === DataType.DOCUMENT
                      ? ".pdf"
                      : ".jpg, .jpeg, .png, .gif, .bmp, .tiff, .ico, .webp"
                  }
                  onChange={handleFileChange}
                  className="h-10 cursor-pointer"
                />
              </div>
              {fileName && (
                <p className="text-xs text-slate-600">
                  Selected: <span className="font-medium">{fileName}</span>
                </p>
              )}
              {errors.file && (
                <p className="text-xs text-red-500">{errors.file}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label
                htmlFor="upload-source"
                className="text-sm font-medium text-slate-700"
              >
                {dataType === DataType.TEXT ? "Text" : "URL"}
              </Label>
              <Input
                id="upload-source"
                placeholder={
                  dataType === DataType.TEXT
                    ? "Paste text content..."
                    : "Enter URL..."
                }
                value={
                  dataType === DataType.TEXT
                    ? formData.text ?? ""
                    : formData.url ?? ""
                }
                onChange={(e) => {
                  if (dataType === DataType.TEXT) {
                    handleChange("text", e.target.value);
                  } else if (dataType === DataType.URL) {
                    handleChange("url", e.target.value);
                  }
                }}
                className="h-10"
              />
              {dataType === DataType.TEXT && errors.text && (
                <p className="text-xs text-red-500">{errors.text}</p>
              )}
              {dataType === DataType.URL && errors.url && (
                <p className="text-xs text-red-500">{errors.url}</p>
              )}
            </div>
          )}

          {/* Source Name */}
          <div className="space-y-2">
            <Label
              htmlFor="source-name"
              className="text-sm font-medium text-slate-700"
            >
              Name
            </Label>
            <Input
              id="source-name"
              placeholder="e.g., Report 2024"
              value={formData.source_label}
              onChange={(e) => handleChange("source_label", e.target.value)}
              className="h-10"
            />
            {errors.source_label && (
              <p className="text-xs text-red-500">{errors.source_label}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-5 h-9 text-sm bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
