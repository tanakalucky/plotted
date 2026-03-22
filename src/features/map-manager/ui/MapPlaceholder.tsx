import { UploadIcon } from "lucide-react";

interface Props {
  onUploadClick: () => void;
}

export const MapPlaceholder = ({ onUploadClick }: Props) => {
  return (
    <div
      className="flex h-64 cursor-pointer flex-col items-center justify-center bg-muted/30 text-muted-foreground"
      onClick={onUploadClick}
      role="button"
      tabIndex={0}
      aria-label="画像をアップロード"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onUploadClick();
      }}
    >
      <UploadIcon className="mb-2 size-8 opacity-50" />
      <span className="text-sm">画像をアップロードしてください</span>
    </div>
  );
};
