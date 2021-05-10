import { useContextApi } from 'app/state/api/context';
import { Order, WithId } from 'appjusto-types';
import React from 'react';
import { ObserveOrdersOptions } from './OrderApi';

export const useOrders = (options: ObserveOrdersOptions, businessId?: string) => {
  // context
  const api = useContextApi();
  // state
  const [orders, setOrders] = React.useState<WithId<Order>[]>([]);
  // side effects
  React.useEffect(() => {
    if (!businessId) return;
    api.order().observeOrders(options, setOrders, businessId);
  }, [options, businessId, api]); //attention to 'options' to avoid infinite renders
  // return
  return orders;
};
