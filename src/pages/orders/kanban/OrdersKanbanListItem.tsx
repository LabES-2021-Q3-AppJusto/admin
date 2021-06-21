import { Box, Button, Flex, HStack, Progress, Text } from '@chakra-ui/react';
import { useFirebaseUserRole } from 'app/api/auth/useFirebaseUserRole';
import { useOrderArrivalTimes } from 'app/api/order/useOrderArrivalTimes';
import { useOrderDeliveryInfos } from 'app/api/order/useOrderDeliveryInfos';
import { getOrderAckTime } from 'app/api/order/utils';
import { useOrdersContext } from 'app/state/order';
import { Order, WithId } from 'appjusto-types';
import { ReactComponent as Alarm } from 'common/img/alarm_outlined.svg';
import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { getTimeUntilNow } from 'utils/functions';
import { t } from 'utils/i18n';

interface CodeLinkProps {
  url: string;
  orderId: string;
  code?: string | null;
}

const CodeLink = ({ url, orderId, code }: CodeLinkProps) => {
  return (
    <Link to={`${url}/${orderId}`}>
      <Text fontSize="lg" textDecor="underline" _hover={{ color: 'green.700' }}>
        #{code}
      </Text>
    </Link>
  );
};

const confirmedKey = 'confirmed';
const preparingKey = 'preparing';

interface Props {
  order: WithId<Order>;
}

export const OrdersKanbanListItem = ({ order }: Props) => {
  // context
  const { url } = useRouteMatch();
  const { business, changeOrderStatus } = useOrdersContext();
  const arrivalTime = useOrderArrivalTimes(order);
  const { isBackofficeUser } = useFirebaseUserRole();
  const {
    isMatched,
    isNoMatch,
    isCurrierArrived,
    isDelivered,
    orderDispatchingKanbanItemText,
  } = useOrderDeliveryInfos(order);

  // state
  const [elapsedTime, setElapsedTime] = React.useState<number | null>(0);

  // helpers
  const showArrivalTime =
    typeof arrivalTime === 'number' &&
    order.dispatchingState !== 'arrived-pickup' &&
    order.dispatchingState !== 'arrived-destination';
  const showArrivalTimeCalc =
    order.dispatchingState !== 'arrived-pickup' && order.dispatchingState !== 'arrived-destination';

  // handlers
  const cookingTime = React.useMemo(() => (order?.cookingTime ? order?.cookingTime / 60 : null), [
    order?.cookingTime,
  ]);
  //const cookingTime = order?.cookingTime ? order?.cookingTime / 60 : null;
  const cookingProgress = cookingTime && elapsedTime ? (elapsedTime / cookingTime) * 100 : 0;
  // const cancelator = orderCancelator(order?.cancellation?.issue?.type);

  // side effects
  React.useEffect(() => {
    if (!order.id) return;
    let localOrderTime: number | null = null;
    const setNewTime = () => {
      if (order.status === 'confirmed') localOrderTime = getOrderAckTime(confirmedKey, order.id);
      if (order.status === 'preparing') localOrderTime = getOrderAckTime(preparingKey, order.id);
      if (localOrderTime) {
        let time = getTimeUntilNow(localOrderTime);
        setElapsedTime(time);
      } else {
        setElapsedTime(null);
      }
    };
    setNewTime();
    const timeInterval = setInterval(setNewTime, 60000);
    if (order.status !== 'confirmed' && order.status !== 'preparing') {
      return clearInterval(timeInterval);
    }
    return () => clearInterval(timeInterval);
  }, [order.id, order.status]);

  React.useEffect(() => {
    // disabled for backoffice users
    if (isBackofficeUser) return;
    // automatic order status change
    const orderAcceptanceTime = business?.orderAcceptanceTime
      ? business?.orderAcceptanceTime / 60
      : undefined;
    if (order?.status === 'confirmed') {
      if (elapsedTime && orderAcceptanceTime && orderAcceptanceTime <= elapsedTime) {
        changeOrderStatus(order.id, 'preparing');
      }
    } else if (order?.status === 'preparing') {
      if (elapsedTime && cookingTime && elapsedTime >= cookingTime) {
        changeOrderStatus(order.id, 'ready');
      }
    }
  }, [
    order,
    elapsedTime,
    business?.orderAcceptanceTime,
    changeOrderStatus,
    cookingTime,
    isBackofficeUser,
  ]);

  // UI
  if (order.status === 'canceled') {
    return (
      <Box
        px="4"
        py="2"
        borderRadius="lg"
        borderColor="gray"
        borderWidth="1px"
        color="gray"
        boxShadow="0px 8px 16px -4px rgba(105,118,103,0.1)"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Text fontSize="xs" lineHeight="lg" fontWeight="500">
              {`{${order.consumer.name ?? 'N/I'}}`}
            </Text>
            <CodeLink url={url} orderId={order.id} code={order.code} />
          </Box>
          <Flex flexDir="column" color="gray.700" fontSize="xs" alignItems="flex-end">
            <Text fontWeight="700">{t('Cancelado')}</Text>
            {/* <Text fontWeight="500">{cancelator}</Text> */}
          </Flex>
        </Flex>
      </Box>
    );
  }

  if (order.status === 'dispatching') {
    return (
      <Box
        px="4"
        py={isDelivered ? '3' : '2'}
        borderRadius="lg"
        borderColor="gray"
        borderWidth="1px"
        color={isDelivered ? 'gray' : 'black'}
        bgColor={isDelivered ? 'gray.500' : 'white'}
        boxShadow="0px 8px 16px -4px rgba(105,118,103,0.1)"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Text fontSize="xs" lineHeight="lg" fontWeight="500">
              {`{${order.consumer.name ?? 'N/I'}}`}
            </Text>
            <CodeLink url={url} orderId={order.id} code={order.code} />
          </Box>
          <Flex flexDir="column" color="gray.700" fontSize="xs" alignItems="flex-end">
            {isDelivered ? (
              <Text fontWeight="700">{t('Pedido entregue')}</Text>
            ) : (
              <>
                <Text fontWeight="700">{orderDispatchingKanbanItemText}</Text>
                {showArrivalTime ? (
                  arrivalTime! > 0 ? (
                    <Text color="gray.700" fontWeight="500">
                      {t(
                        `Aprox. ${
                          arrivalTime! > 1 ? arrivalTime + ' minutos' : arrivalTime + ' minuto'
                        }`
                      )}
                    </Text>
                  ) : (
                    <Text color="gray.700" fontWeight="500">
                      {t(`Menos de 1 minuto`)}
                    </Text>
                  )
                ) : (
                  showArrivalTimeCalc && (
                    <Text color="gray.700" fontWeight="500">
                      {t(`Calculando...`)}
                    </Text>
                  )
                )}
              </>
            )}
          </Flex>
        </Flex>
      </Box>
    );
  }

  if (order.status === 'ready') {
    return (
      <Box
        p="4"
        borderRadius="lg"
        borderColor={isCurrierArrived ? 'black' : 'gray'}
        borderWidth={isCurrierArrived ? '2px' : '1px'}
        color="black"
        boxShadow="0px 8px 16px -4px rgba(105,118,103,0.1)"
      >
        <Flex flexDir="column" fontWeight="700">
          <Flex justifyContent="space-between">
            <Box>
              <Text fontSize="xs" lineHeight="lg" fontWeight="500">
                {`{${order.consumer.name ?? 'N/I'}}`}
              </Text>
              <CodeLink url={url} orderId={order.id} code={order.code} />
            </Box>
            <Flex flexDir="column" fontSize="xs" alignItems="flex-end">
              <Text
                color={isNoMatch || isCurrierArrived ? 'red' : 'gray.700'}
                fontWeight="700"
                textAlign="end"
              >
                {orderDispatchingKanbanItemText}
              </Text>
              {isMatched &&
                (isCurrierArrived ? (
                  <>
                    <Text color="black" fontWeight="500">
                      {t('Nome: ') + order.courier?.name}
                    </Text>
                  </>
                ) : (
                  <>
                    {showArrivalTime ? (
                      arrivalTime! > 0 ? (
                        <Text color="gray.700" fontWeight="500">
                          {t(
                            `Aprox. ${
                              arrivalTime! > 1 ? arrivalTime + ' minutos' : arrivalTime + ' minuto'
                            }`
                          )}
                        </Text>
                      ) : (
                        <Text color="gray.700" fontWeight="500">
                          {t(`Menos de 1 minuto`)}
                        </Text>
                      )
                    ) : (
                      <Text color="gray.700" fontWeight="500">
                        {t(`Calculando...`)}
                      </Text>
                    )}
                  </>
                ))}
            </Flex>
          </Flex>
        </Flex>
        <Button
          isDisabled={!isCurrierArrived}
          mt="2"
          w="full"
          maxH="34px"
          siz="xs"
          fontSize="xs"
          onClick={() => changeOrderStatus(order.id, 'dispatching')}
        >
          {t('Entregar pedido')}
        </Button>
      </Box>
    );
  }

  if (order.status === 'preparing') {
    return (
      <Box
        p="4"
        borderRadius="lg"
        borderColor="black"
        borderWidth="2px"
        color="black"
        boxShadow="0px 8px 16px -4px rgba(105,118,103,0.1)"
      >
        <Flex flexDir="column" fontWeight="700">
          <Flex justifyContent="space-between">
            <Box>
              <Text fontSize="xs" lineHeight="lg" fontWeight="500">
                {`{${order.consumer.name ?? 'N/I'}}`}
              </Text>
              <CodeLink url={url} orderId={order.id} code={order.code} />
            </Box>
            <Flex flexDir="column">
              <HStack spacing={2} justifyContent="space-between">
                <HStack spacing={1}>
                  <Alarm />
                  <Text fontSize="xs">{elapsedTime ?? 0} min</Text>
                </HStack>
                <Text fontSize="xs" color="gray.700">
                  {cookingTime ? `${cookingTime} min` : 'N/I'}
                </Text>
              </HStack>
              <Progress
                mt="1"
                ml="22px"
                w="80px"
                size="sm"
                value={cookingProgress}
                colorScheme="green"
                borderRadius="lg"
              />
            </Flex>
          </Flex>
        </Flex>
        <Button
          mt="3"
          w="full"
          maxH="34px"
          siz="xs"
          fontSize="xs"
          onClick={() => changeOrderStatus(order.id, 'ready')}
        >
          {t('Pedido pronto')}
        </Button>
      </Box>
    );
  }
  return (
    <Link to={`${url}/${order.id}`}>
      <Box
        p="4"
        bg="green.300"
        borderRadius="lg"
        borderColor="black"
        borderWidth="2px"
        color="black"
        cursor="pointer"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Text fontSize="xs" lineHeight="lg">
              {`{${order.consumer.name ?? 'N/I'}}`}
            </Text>
            <Text fontSize="lg" fontWeight="700">
              #{order.code}
            </Text>
          </Box>
          {elapsedTime && elapsedTime > 0 ? (
            <Text fontSize="sm">{t(`${elapsedTime} min. atrás`)}</Text>
          ) : (
            <Text fontSize="sm">{t(`Agora`)}</Text>
          )}
        </Flex>
      </Box>
    </Link>
  );
};
