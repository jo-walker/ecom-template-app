// src/app/models/transaction.model.ts
export interface Item {
    name: string;
    price: number;
    sku: string;
  }
  
  export interface Transaction {
    id: string;
    items: Item[];
  }  