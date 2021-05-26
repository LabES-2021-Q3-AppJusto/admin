import { WithId, Order } from 'appjusto-types';
import React from 'react';
//@ts-ignore
import bellDing from 'common/sounds/bell-ding.mp3';
import useSound from 'use-sound';

type LocalOrders = {
  code: string;
  time: number;
};

export const useOrdersLocalStorageTimes = (orders: WithId<Order>[]) => {
  // state
  const [usedOrders, setUsedOrders] = React.useState<string[]>();
  const [localOrders, setLocalOrders] = React.useState<LocalOrders[]>();

  // order sound
  const [playBell] = useSound(bellDing, { volume: 2 });

  // handlers
  const getLocalStorageOrderTime = React.useCallback(
    (orderId: string) => {
      if (localOrders) {
        const order = localOrders.find((item: LocalOrders) => item.code === orderId);
        return order ? order.time : null;
      }
      return null;
    },
    [localOrders]
  );

  const updateLocalStorageOrderTime = React.useCallback(
    (orderId: string) => {
      if (localOrders) {
        const newArray = localOrders.map((item: LocalOrders) => {
          if (item.code === orderId) {
            return { ...item, time: new Date().getTime() };
          } else {
            return item;
          }
        });
        setLocalOrders(newArray);
        return true;
      }
      return false;
    },
    [localOrders]
  );

  // side effects
  React.useEffect(() => {
    if (!orders) return;
    setUsedOrders(
      orders
        .filter((order) => order.status === 'confirmed' || order.status === 'preparing')
        .map((order) => order.id)
    );
  }, [orders]);

  React.useEffect(() => {
    if (!usedOrders) return;
    const storageItem = localStorage.getItem('appjusto-orders');
    const sotageOrders = storageItem ? JSON.parse(storageItem) : [];

    usedOrders.forEach((orderId) => {
      const isNew =
        sotageOrders.map((order: LocalOrders) => order.code).includes(orderId) === false;
      if (isNew) {
        playBell();
        const newOrder = { code: orderId, time: new Date().getTime() };
        setLocalOrders((prev) => (prev ? [...prev, newOrder] : [newOrder]));
      }
    });
    setLocalOrders((prev) => {
      if (prev) return prev.filter((item) => usedOrders.includes(item.code));
    });
  }, [usedOrders]);

  React.useEffect(() => {
    if (!usedOrders || !localOrders) return;
    const filteredLocalOrders = localOrders.filter((item) => usedOrders.includes(item.code));
    localStorage.setItem('appjusto-orders', JSON.stringify(filteredLocalOrders));
  }, [localOrders, usedOrders]);

  // result handlers
  return { getLocalStorageOrderTime, updateLocalStorageOrderTime };
};
