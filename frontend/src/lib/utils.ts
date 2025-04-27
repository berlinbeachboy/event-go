import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get initials for avatar fallback
export function getInitials(name?: string){
  if (!name) return "U";
  return name.split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

  export function formatFullName(name: string){
    if (!name) return '';
    
    const parts = name.trim().split(/\s+/);
    
    if (parts.length === 1) {
      return parts[0];
    }
    
    const firstName = parts[0];
    const lastNameInitial = parts[1][0];
    if (parts.length === 3) {
      const vlastNameInitial = parts[2][0];
      return `${firstName} ${lastNameInitial}${vlastNameInitial}.`;
    }
    
    return `${firstName} ${lastNameInitial}.`;
  };