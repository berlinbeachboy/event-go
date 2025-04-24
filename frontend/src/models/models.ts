// api/types.ts
export interface User {
    id: number;
    username: string | null;
    type: string;
    nickname: string;
    fullName: string;
    phone: string | null;
    takesSoli: boolean;
    soliAmount: number;
    lastLogin: Date;
    amountPaid: number;
    amountToPay: number;
    createdAt?: string;
    updatedAt?: string;
    spotTypeId: number | null;
    spotType: SpotType | null;
  }
  
  export interface UserResponse extends Omit<User, 'updatedAt'> {
    amountToPay: number;
  }
  
  export interface SpotType {
    id: number;
    name: string;
    price: number;
    limit: number;
    description: string | null;
    currentCount: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  // Define the Shift type to match your API structure
  export interface Shift {
    id: number;
    name: string;
    headCount: number;
    points: number;
    day: string;
    description: string | null;
    startTime: string | null; // We'll parse this later
    currentCount: number;
    userNames: string[] | null;
  }
  
