export interface SpotType {
    id: number;
    name: string;
    price: number;
    limit: number
    description: string;
    currentCount: number;
  }
  
  export interface UserType {
    id: number;
    username: string;
    nickname: string;
    fullName: string;
    phone: string;
    type: string; // 'admin' or 'reg' 
  
    givesSoli: boolean;
    takesSoli: boolean;
    amountToPay: number;
    amountPaid: number;
  
    lastLogin: Date;
    createdAt: Date;
  
    spotTypeId: number
    spotType: SpotType
  }