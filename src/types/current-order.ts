import { OrderItem, CurrentOrderMetadata } from '@/types';

export interface CurrentOrderData {
  items: OrderItem[];
  metadata: CurrentOrderMetadata;
}