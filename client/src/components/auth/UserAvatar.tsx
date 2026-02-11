import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  return (
    <Avatar className={className}>
      <AvatarImage 
        src={photoURL || ""} 
        alt={displayName || "User avatar"} 
        className="object-cover"
      />
      <AvatarFallback className="bg-primary/10 text-primary font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
