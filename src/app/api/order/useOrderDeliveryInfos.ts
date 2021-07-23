import { DispatchingState, Order, WithId } from 'appjusto-types';
import { DispatchingStatus } from 'appjusto-types/order/dispatching';
import React from 'react';
import { useOrderArrivalTimes } from './useOrderArrivalTimes';

export const useOrderDeliveryInfos = (order?: WithId<Order> | null) => {
  // context
  const arrivalTime = useOrderArrivalTimes(order);
  // state
  const [isOrderActive, setIsOrderActive] = React.useState<boolean>();
  const [isMatching, setIsMatching] = React.useState<boolean>(
    order?.dispatchingStatus === 'matching'
  );
  const [isMatched, setIsMatched] = React.useState<boolean>(order?.dispatchingStatus === 'matched');
  const [isNoMatch, setIsNoMatch] = React.useState<boolean>(
    order?.dispatchingStatus === 'no-match'
  );
  const [
    orderDispatchingKanbanItemText,
    setOrderDispatchingKanbanItemText,
  ] = React.useState<string>();
  const [orderDispatchingText, setOrderDispatchingText] = React.useState<string>();
  const [isCurrierArrived, setIsCurrierArrived] = React.useState<boolean>(
    order?.dispatchingState === 'arrived-pickup'
  );
  const [isDelivered, setIsDelivered] = React.useState<boolean>(order?.status === 'delivered');

  // side effects
  React.useEffect(() => {
    if (!order?.status) return;
    setIsOrderActive(['confirmed', 'preparing', 'ready', 'dispatching'].includes(order.status));
    setIsDelivered(order.status === 'delivered');
  }, [order?.status]);

  React.useEffect(() => {
    if (!order?.dispatchingStatus) return;
    const getOrderDispatchingKanbanItemText = (
      status: DispatchingStatus,
      state?: DispatchingState
    ) => {
      let result = 'Buscando entregador...';
      if (status === 'matched' || status === 'confirmed') {
        result = 'Buscando localização';
        if (state === 'going-pickup') result = 'Entreg. a caminho';
        if (state === 'arrived-pickup') result = 'Entreg. no local';
        if (state === 'going-destination') result = 'Pedido a caminho';
        if (state === 'arrived-destination') result = 'Entreg. no local de entrega';
      } else if (status === 'no-match') result = 'Entreg. não encontrado';
      else if (status === 'outsourced') result = 'Logística fora da rede';
      setOrderDispatchingKanbanItemText(result);
    };
    const getOrderDispatchingText = (status: DispatchingStatus, state?: DispatchingState) => {
      let result = 'Buscando entregador...';
      if (status === 'matched' || status === 'confirmed') {
        result = 'Buscando localização';
        if (state === 'going-pickup') result = 'Entregador a caminho da retirada';
        if (state === 'arrived-pickup') result = 'Entregador no local';
        if (state === 'going-destination') result = 'Entregador a caminho da entrega';
        if (state === 'arrived-destination') result = 'Entregador no local de entrega';
      } else if (status === 'no-match') result = 'Entregador não encontrado';
      else if (status === 'outsourced') result = 'Logística fora da rede';
      setOrderDispatchingText(result);
    };
    getOrderDispatchingKanbanItemText(order.dispatchingStatus, order?.dispatchingState);
    getOrderDispatchingText(order.dispatchingStatus, order?.dispatchingState);
    setIsCurrierArrived(order.dispatchingState === 'arrived-pickup');
  }, [order?.dispatchingState, order?.dispatchingStatus]);

  React.useEffect(() => {
    if (!order?.dispatchingStatus) return;
    setIsMatching(order.dispatchingStatus === 'matching');
    setIsMatched(order.dispatchingStatus === 'matched' || order.dispatchingStatus === 'confirmed');
    setIsNoMatch(order.dispatchingStatus === 'no-match');
  }, [order?.dispatchingStatus]);

  // result
  return {
    isOrderActive,
    isMatching,
    isMatched,
    isNoMatch,
    isCurrierArrived,
    arrivalTime,
    orderDispatchingKanbanItemText,
    orderDispatchingText,
    isDelivered,
  };
};
