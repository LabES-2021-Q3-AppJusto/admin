import { useContextApi } from 'app/state/api/context';
import { useContextBusinessId } from 'app/state/business/context';
import { ChatMessage, Flavor, Order, OrderStatus, WithId } from 'appjusto-types';
import React from 'react';
import { useMutation } from 'react-query';
import { useCourierProfilePicture } from '../courier/useCourierProfilePicture';
import { GroupedChatMessages } from 'app/api/chat/types';
import { groupOrderChatMessages, sortMessages } from 'app/api/chat/utils';

const orderActivedStatuses = ['confirmed', 'preparing', 'ready', 'dispatching'] as OrderStatus[];

export const useOrderChat = (orderId: string, counterpartId: string) => {
  // context
  const api = useContextApi();
  const businessId = useContextBusinessId();
  const courierProfilePicture = useCourierProfilePicture(counterpartId);

  // state
  const [order, setOrder] = React.useState<WithId<Order> | null>();
  const [isActive, setIsActive] = React.useState(false);
  const [participants, setParticipants] = React.useState({});
  const [chatFromBusiness, setChatFromBusiness] = React.useState<WithId<ChatMessage>[]>([]);
  const [chatFromCounterPart, setChatFromCounterPart] = React.useState<WithId<ChatMessage>[]>([]);
  const [chat, setChat] = React.useState<GroupedChatMessages[]>([]);
  //const [chat, setChat] = React.useState<WithId<ChatMessage>[]>([]);

  // handlers;
  const [sendMessage, sendMessageResult] = useMutation(async (data: Partial<ChatMessage>) => {
    if (!businessId) return;
    const from = { agent: 'business' as Flavor, id: businessId };
    api.order().sendMessage(orderId, {
      from,
      ...data,
    });
  });

  // side effects
  React.useEffect(() => {
    if (!orderId) return;
    const unsub = api.order().observeOrder(orderId, setOrder);
    return () => unsub();
  }, [api, orderId]);

  React.useEffect(() => {
    if (!orderId || !businessId || !counterpartId) return;
    const unsub2 = api
      .order()
      .observeOrderChat(orderId, businessId, counterpartId, setChatFromBusiness);
    const unsub3 = api
      .order()
      .observeOrderChat(orderId, counterpartId, businessId, setChatFromCounterPart);
    return () => {
      unsub2();
      unsub3();
    };
  }, [api, orderId, businessId, counterpartId]);

  React.useEffect(() => {
    if (!order) return;
    let counterpartName = 'N/E';
    let flavor = 'courier';
    //let code = 'N/E';
    if (order.consumer?.id === counterpartId) {
      //code = order.consumer.id;
      flavor = 'consumer';
      counterpartName = order.consumer?.name ?? 'N/E';
    } else if (order.courier?.id === counterpartId) {
      //code = order.courier.id;
      counterpartName = order.courier?.name ?? 'N/E';
    }
    const participantsObject = {
      [businessId!]: {
        name: order.business?.name ?? 'N/E',
        image: null,
      },
      [counterpartId]: {
        //code,
        name: counterpartName,
        flavor,
        image: courierProfilePicture,
      },
    };
    setParticipants(participantsObject);
  }, [order, counterpartId, businessId, courierProfilePicture]);

  React.useEffect(() => {
    if (order?.status && orderActivedStatuses.includes(order.status)) {
      setIsActive(true);
    } else setIsActive(false);
  }, [order?.status]);

  React.useEffect(() => {
    const sorted = chatFromBusiness.concat(chatFromCounterPart).sort(sortMessages);
    const groups = groupOrderChatMessages(sorted).reverse();
    setChat(groups);
    //setChat(sorted);
  }, [chatFromBusiness, chatFromCounterPart]);

  // return
  return { isActive, orderCode: order?.code, participants, chat, sendMessage, sendMessageResult };
};
