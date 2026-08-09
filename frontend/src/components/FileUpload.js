import React, { useRef, useState } from "react";
import { Upload, Loader2, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/api";

const cls = "w-full rounded-lg bg-[color:var(--lux-charcoal)] border border-[color:var(--border-hairline)] px-3 py-2.5 text-sm text-ivory placeholder:text-[color:var(--lux-ivory)]/40 focus:outline-none focus:ring-2 focus:ring-[rgba(212,175,55,0.35)]";

/**
 * FileUpload — upload an image/pdf and get a hosted URL, or paste a URL.
 * props: value (string url), onChange(url), accept, label, isImage (show preview)
 */
export const FileUpload = ({ value = "", onChange, accept = "image/*", label, isImage = true, testid }) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadFile(file);
      onChange(res.url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const isPdf = value && value.toLowerCase().endsWith(".pdf");

  return (
    <div>
      {label && <label className="text-xs text-platinum mb-1 block">{label}</label>}
      <div className="flex items-center gap-3">
        {isImage && value && !isPdf && (
          <div className="relative shrink-0">
            <img src={value} alt="preview" className="h-14 w-14 rounded-lg object-cover border border-[color:var(--border-hairline)]" />
            <button type="button" onClick={() => onChange("")} className="absolute -top-1.5 -right-1.5 h-5 w-5 grid place-items-center rounded-full bg-black/80 text-ivory border border-[color:var(--border-hairline)]"><X className="h-3 w-3" /></button>
          </div>
        )}
        {isPdf && (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-gold"><FileText className="h-4 w-4" /> PDF</span>
        )}
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste URL or upload" className={cls} data-testid={testid} />
        <button type="button" onClick={pick} disabled={busy} data-testid={testid ? `${testid}-upload` : undefined}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border gold-line bg-[rgba(212,175,55,0.08)] px-3 py-2.5 text-xs font-semibold text-gold hover:bg-[rgba(212,175,55,0.16)] disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
        </button>
        <input ref={inputRef} type="file" accept={accept} onChange={handle} className="hidden" />
      </div>
    </div>
  );
};

export default FileUpload;
