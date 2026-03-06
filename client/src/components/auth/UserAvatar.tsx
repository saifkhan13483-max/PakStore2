import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SEED_AVATARS, SEED_AVATAR_SPRITE } from "@shared/user-seeds";
import avatarSpritePath from "@assets/image_1772779678802.png";

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
  className?: string;
}

export function UserAvatar({ photoURL, displayName, email, className }: UserAvatarProps) {
  const initials = displayName
    ? displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : email
    ? email[0].toUpperCase()
    : "U";

  // Use seed avatar as fallback if no photoURL is provided
  const getSeedAvatar = () => {
    if (!email) return "sprite:0";
    const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `sprite:${hash % SEED_AVATARS.length}`;
  };

  const displayPhotoURL = photoURL || getSeedAvatar();
  const isSprite = displayPhotoURL?.startsWith("sprite:");

  if (isSprite) {
    const index = parseInt(displayPhotoURL.split(":")[1]);
    const row = Math.floor(index / 6);
    const col = index % 6;
    
    // 6 columns, 3 rows
    const backgroundPosition = `${(col * 100) / 5}% ${(row * 100) / 2}%`;
    
    return (
      <Avatar className={className}>
        <div 
          className="w-full h-full bg-no-repeat"
          style={{
            backgroundImage: `url(${avatarSpritePath})`,
            backgroundSize: '600% 300%',
            backgroundPosition: backgroundPosition,
          }}
          aria-label={displayName || "User avatar"}
        />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={className}>
      <AvatarImage 
        src={displayPhotoURL} 
        alt={displayName || "User avatar"} 
        className="object-cover"
      />
      <AvatarFallback className="bg-primary/10 text-primary font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
