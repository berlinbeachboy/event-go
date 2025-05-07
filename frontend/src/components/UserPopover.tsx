import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatFullName, getInitials } from "@/lib/utils";

interface UserPopoverProps {
  fullname: string;
  nickname: string;
  avatarUrlLg: string
  triggerElement: React.ReactNode;
}

const UserPopover = ({ fullname, nickname, avatarUrlLg, triggerElement }: UserPopoverProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePopoverOpenChange = (open: boolean) => {
    if (open && !isLoaded) {
      // Only fetch the avatar URL if we haven't already loaded it
      // This could be a direct URL construction or an API call
      setAvatarUrl(avatarUrlLg);
      setIsLoaded(true);
    }
  };

  return (
    <Popover onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        {triggerElement}
      </PopoverTrigger>
      <PopoverContent className="w-50">
        <div className="w-full font-medium p-2 items-center text-center">
            <Avatar className="h-32 w-32 border-2 border-gray-200">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(fullname)}
                </AvatarFallback>
            </Avatar>
            <h3> <b>{nickname +"  " || 'Kein Spitzname'}</b></h3>
            <h5>({formatFullName(fullname)})</h5>
        </div>
        </PopoverContent>
    </Popover>
  );
};

export default UserPopover;