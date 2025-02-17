
interface MessagePreviewProps {
  message: string;
  signature?: string;
}

export const MessagePreview = ({ message, signature = "Bot" }: MessagePreviewProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">{message}</p>
      {signature && (
        <p className="text-xs text-gray-400 mt-2">- {signature}</p>
      )}
    </div>
  );
};
