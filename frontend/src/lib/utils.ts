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

  export function formatTime(timeString: string | null){
    if (!timeString) return '—';
    try {
      return new Date(timeString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Set to true if you want 12-hour format
      });
    } catch (e) {
      return '—';
    }
  };

  export const compareTimeOnly = (date1: Date, date2: Date): number => {
    // Extract hours and minutes from both dates
    const hours1 = date1.getHours();
    const minutes1 = date1.getMinutes();
    
    const hours2 = date2.getHours();
    const minutes2 = date2.getMinutes();
    
    // Convert to minutes since midnight for easy comparison
    const timeInMinutes1 = hours1 * 60 + minutes1;
    const timeInMinutes2 = hours2 * 60 + minutes2;
    
    // Compare and return appropriate value
    if (timeInMinutes1 < timeInMinutes2) return -1;
    if (timeInMinutes1 > timeInMinutes2) return 1;
    return 0;
  };