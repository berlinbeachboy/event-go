// api/types.ts
export interface User {
    id: number;
    username: string | null;
    type: string;
    nickname: string;
    fullName: string | null;
    phone: string | null;
    givesSoli: boolean;
    takesSoli: boolean;
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
  
  
