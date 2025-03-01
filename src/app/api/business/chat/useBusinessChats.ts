import { useContextApi } from 'app/state/api/context';
import { useContextBusinessId } from 'app/state/business/context';
import { ChatMessage, Order, WithId } from 'appjusto-types';
import React from 'react';
import { OrderChatGroup } from 'app/api/chat/types';

export interface BusinessChatMessage extends ChatMessage {
  orderId: string;
}

export const useBusinessChats = (
  activeOrders: WithId<Order>[],
  completedAndActiveOrders: WithId<Order>[]
) => {
  // context
  const api = useContextApi();
  const businessId = useContextBusinessId();
  // state
  const [totalActiveOrders, setTotalActiveOrders] = React.useState<WithId<Order>[]>([]);
  const [messagesAsFrom, setMessagesAsFrom] = React.useState<WithId<BusinessChatMessage>[]>([]);
  const [messagesAsTo, setMessagesAsTo] = React.useState<WithId<BusinessChatMessage>[]>([]);
  const [orderChatGroup, setOrderChatGroup] = React.useState<OrderChatGroup[]>([]);
  // side effects
  React.useEffect(() => {
    setTotalActiveOrders([...activeOrders, ...completedAndActiveOrders]);
  }, [activeOrders, completedAndActiveOrders]);
  React.useEffect(() => {
    if (!businessId) return;
    if (totalActiveOrders.length === 0) {
      setOrderChatGroup([]);
      return;
    }
    totalActiveOrders.forEach((order) => {
      api.business().observeBusinessChatMessageAsFrom(order.id, businessId, setMessagesAsFrom);
      api.business().observeBusinessChatMessageAsTo(order.id, businessId, setMessagesAsTo);
    });
  }, [api, businessId, totalActiveOrders]);
  React.useEffect(() => {
    const totalActiveOrdersIds = totalActiveOrders.map((order) => order.id);
    //console.log('AcOrIds', totalActiveOrdersIds);
    setMessagesAsFrom((prev) => prev.filter((msg) => totalActiveOrdersIds.includes(msg.orderId)));
    setMessagesAsTo((prev) => prev.filter((msg) => totalActiveOrdersIds.includes(msg.orderId)));
  }, [totalActiveOrders]);
  React.useEffect(() => {
    if (!businessId) return;
    const allMessages = messagesAsFrom.concat(messagesAsTo);
    //console.log('allMessages', allMessages.length);
    const result = allMessages.reduce<OrderChatGroup[]>((groups, message) => {
      const existingGroup = groups.find((group) => group.orderId === message.orderId);
      const counterPartId = businessId === message.from.id ? message.to.id : message.from.id;
      const counterPartFlavor =
        counterPartId === message.from.id ? message.from.agent : message.to.agent;
      const isUnread = message.from.id !== businessId && !message.read;
      const counterPartObject = {
        id: counterPartId,
        flavor: counterPartFlavor,
        updatedOn: message.timestamp,
        unreadMessages: isUnread ? [message.id] : [],
      };
      if (existingGroup) {
        const existingCounterpart = existingGroup.counterParts.find(
          (part) => part.id === counterPartId
        );
        if (existingCounterpart) {
          if (
            isUnread &&
            (!existingCounterpart.unreadMessages ||
              !existingCounterpart.unreadMessages?.includes(message.id))
          ) {
            existingCounterpart.unreadMessages
              ? existingCounterpart.unreadMessages.push(message.id)
              : (existingCounterpart.unreadMessages = [message.id]);
          } else {
            existingCounterpart.unreadMessages = existingCounterpart.unreadMessages?.filter(
              (msg) => msg !== message.id
            );
          }
          if (existingCounterpart.updatedOn < message.timestamp) {
            existingCounterpart.updatedOn = message.timestamp;
          }
          return groups;
        }
        existingGroup.counterParts.push(counterPartObject);
        return groups;
      }
      return [
        {
          orderId: message.orderId,
          lastUpdate: message.timestamp,
          counterParts: [counterPartObject],
        },
        ...groups,
      ];
    }, []);
    setOrderChatGroup(result);
  }, [messagesAsFrom, messagesAsTo, businessId]);
  // return
  return orderChatGroup;
};
