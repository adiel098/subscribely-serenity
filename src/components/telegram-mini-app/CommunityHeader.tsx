
interface CommunityHeaderProps {
  community: {
    name: string;
    description: string | null;
    telegram_photo_url: string | null;
  };
}

export const CommunityHeader = ({ community }: CommunityHeaderProps) => {
  return (
    <div className="text-center space-y-4">
      {community.telegram_photo_url && (
        <img 
          src={community.telegram_photo_url} 
          alt={community.name}
          className="w-24 h-24 rounded-full mx-auto"
        />
      )}
      <h1 className="text-2xl font-bold">{community.name}</h1>
      {community.description && (
        <p className="text-gray-600">{community.description}</p>
      )}
    </div>
  );
};
