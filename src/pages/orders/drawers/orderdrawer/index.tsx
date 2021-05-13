import { Text } from '@chakra-ui/react';
import { CancellationData } from 'app/api/order/OrderApi';
import { useOrder } from 'app/api/order/useOrder';
import { useContextManagerProfile } from 'app/state/manager/context';
import { Issue, WithId } from 'appjusto-types';
import { SectionTitle } from 'pages/backoffice/drawers/generics/SectionTitle';
import React from 'react';
import { useParams } from 'react-router-dom';
import { orderCancelator } from 'utils/functions';
import { t } from 'utils/i18n';
import { OrderBaseDrawer } from '../OrderBaseDrawer';
import { Cancelation } from './Cancelation';
import { CookingTime } from './CookingTime';
import { DeliveryInfos } from './DeliveryInfos';
import { OrderDetails } from './OrderDetails';
import { OrderIssuesTable } from './OrderIssuesTable';

interface Props {
  isOpen: boolean;
  onClose(): void;
}

type Params = {
  orderId: string;
};

export const OrderDrawer = (props: Props) => {
  //context
  const isError = false;
  const error = '';
  const { orderId } = useParams<Params>();
  const { order, cancelOrder, orderIssues } = useOrder(orderId);
  const { manager } = useContextManagerProfile();

  // state
  const [isCanceling, setIsCanceling] = React.useState(false);
  //const [orderIssue, setOrderIssue] = React.useState<WithId<OrderIssue>>();

  // helpers
  const isCurrierArrived = order?.dispatchingState === 'arrived-pickup';
  const cancelator = orderCancelator(order?.cancellation?.issue.type);

  // handlers
  const handleCancel = async (issue: WithId<Issue>) => {
    if (!manager?.id || !manager?.name) {
      console.dir({
        error: 'Order cancellation incomplete',
        id: manager?.id,
        name: manager?.name,
      });
      return;
    }
    const cancellationData = {
      canceledBy: {
        id: manager?.id,
        name: manager?.name,
      },
      issue,
    } as CancellationData;
    await cancelOrder(cancellationData);
    props.onClose();
  };

  // side effects
  /*React.useEffect(() => {
    if (orderIssues) {
      const issue = orderIssues.find((data) =>
        ['courier-cancel', 'consumer-cancel', 'restaurant-cancel'].includes(data.issue.type)
      );
      setOrderIssue(issue);
    };
  }, [orderIssues]);*/

  // UI
  return (
    <OrderBaseDrawer
      {...props}
      orderId={orderId}
      orderCode={order?.code ?? ''}
      orderStatus={order?.status!}
      cancelator={cancelator}
      isCurrierArrived={isCurrierArrived}
      client={order?.consumer?.name ?? ''}
      clientOrders={0}
      cancel={() => setIsCanceling(true)}
      isCanceling={isCanceling}
      isError={isError}
      error={error}
    >
      {isCanceling ? (
        <Cancelation handleConfirm={handleCancel} handleKeep={() => setIsCanceling(false)} />
      ) : (
        <>
          {(order?.status === 'ready' || order?.status === 'dispatching') && (
            <DeliveryInfos order={order} />
          )}
          <OrderDetails order={order} />
          {order?.status === 'canceled' && (
            <>
              <SectionTitle>{t('Dados do cancelamento')}</SectionTitle>
              <Text mt="1" fontSize="md" fontWeight="700" color="black">
                {t('Motivo:')}{' '}
                <Text as="span" fontWeight="500">
                  {order.cancellation?.issue.title ?? 'N/E'}
                </Text>
              </Text>
              <Text mt="1" fontSize="md" fontWeight="700" color="black">
                {t('Comentário:')}{' '}
                <Text as="span" fontWeight="500">
                  {order.cancellation?.comment ?? 'N/E'}
                </Text>
              </Text>
            </>
          )}
          {orderIssues && <OrderIssuesTable issues={orderIssues} />}
          {(order?.status === 'confirmed' || order?.status === 'preparing') && (
            <CookingTime orderId={order.id} cookingTime={order.cookingTime} />
          )}
        </>
      )}
    </OrderBaseDrawer>
  );
};
