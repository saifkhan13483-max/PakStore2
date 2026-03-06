import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SEED_AVATARS } from "@shared/user-seeds";

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
    if (!email) return SEED_AVATARS[0].url;
    const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return SEED_AVATARS[hash % SEED_AVATARS.length].url;
  };

  const displayPhotoURL = photoURL || getSeedAvatar();

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
