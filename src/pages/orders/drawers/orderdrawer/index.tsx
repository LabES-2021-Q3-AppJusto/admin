import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { useGetOutsourceDelivery } from 'app/api/order/useGetOutsourceDelivery';
import { useOrder } from 'app/api/order/useOrder';
import { useContextBusiness } from 'app/state/business/context';
import { useContextManagerProfile } from 'app/state/manager/context';
import { CancelOrderPayload, Issue, WithId } from 'appjusto-types';
import { CustomButton } from 'common/components/buttons/CustomButton';
import { SuccessAndErrorHandler } from 'common/components/error/SuccessAndErrorHandler';
import { initialError } from 'common/components/error/utils';
import { SectionTitle } from 'pages/backoffice/drawers/generics/SectionTitle';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency } from 'utils/formatters';
import { getOrderCancellator, useQuery } from 'utils/functions';
import { t } from 'utils/i18n';
import { OrderBaseDrawer } from '../OrderBaseDrawer';
import { Cancelation } from './Cancelation';
import { CookingTime } from './CookingTime';
import { DeliveryInfos } from './DeliveryInfos';
import { OrderDetails } from './OrderDetails';
import { OrderIssuesTable } from './OrderIssuesTable';
import { OrderToPrinting } from './OrderToPrinting';

interface Props {
  isOpen: boolean;
  onClose(): void;
}

type Params = {
  orderId: string;
};

export const OrderDrawer = (props: Props) => {
  //context
  const query = useQuery();
  const { orderId } = useParams<Params>();
  const { business } = useContextBusiness();
  const {
    order,
    cancelOrder,
    //updateOrder,
    updateResult,
    cancelResult,
    orderIssues,
    orderCancellation,
    orderCancellationCosts,
    invoices,
  } = useOrder(orderId);
  const { manager } = useContextManagerProfile();
  const { getOutsourceDelivery, outsourceDeliveryResult } = useGetOutsourceDelivery(orderId);
  // state
  const [isCanceling, setIsCanceling] = React.useState(false);
  const [isOutsourceDelivery, setIsOutsourceDelivery] = React.useState<boolean>();
  const [error, setError] = React.useState(initialError);
  // refs
  const submission = React.useRef(0);
  const printComponent = React.useRef<HTMLDivElement>(null);
  // helpers
  const cancellator = getOrderCancellator(orderCancellation?.issue?.type);
  const deliveryFare = order?.fare?.courier.value
    ? formatCurrency(order.fare.courier.value)
    : 'N/E';
  // handlers
  const handleCancel = async (issue: WithId<Issue>) => {
    submission.current += 1;
    if (!manager?.id || !manager?.name) {
      return setError({
        status: true,
        error: {
          error: 'Order cancellation incomplete. There is no manager:',
          id: manager?.id,
          name: manager?.name,
        },
        message: {
          title: 'Não foi possível cancelar o pedido.',
          description: 'Verifica a conexão com a internet?',
        },
      });
    }
    const cancellationData = {
      orderId,
      acknowledgedCosts: orderCancellationCosts,
      cancellation: issue,
    } as CancelOrderPayload;
    await cancelOrder(cancellationData);
    props.onClose();
  };
  const printOrder = useReactToPrint({
    content: () => printComponent.current,
  });
  // side effects
  React.useEffect(() => {
    if (!query || isOutsourceDelivery !== undefined) return;
    if (order?.dispatchingStatus === 'outsourced') setIsOutsourceDelivery(true);
    if (query.get('outsource')) setIsOutsourceDelivery(true);
  }, [query, isOutsourceDelivery, order]);
  React.useEffect(() => {
    if (updateResult.isError) {
      setError({
        status: true,
        error: updateResult.error,
      });
    } else if (cancelResult.isError) {
      setError({
        status: true,
        error: cancelResult.error,
      });
    }
  }, [updateResult.isError, updateResult.error, cancelResult.isError, cancelResult.error]);
  // UI
  return (
    <OrderBaseDrawer
      {...props}
      order={order}
      cancellator={cancellator}
      cancel={() => setIsCanceling(true)}
      isCanceling={isCanceling}
      printOrder={printOrder}
      orderPrinting={business?.orderPrinting}
    >
      <Box position="relative">
        <Box w="100%">
          {isCanceling ? (
            <Cancelation
              handleConfirm={handleCancel}
              handleKeep={() => setIsCanceling(false)}
              isLoading={cancelResult.isLoading}
              orderCancellationCosts={orderCancellationCosts}
            />
          ) : (
            <>
              {(order?.status === 'ready' || order?.status === 'dispatching') &&
                (isOutsourceDelivery ? (
                  order.dispatchingStatus === 'outsourced' ? (
                    <Box mt="4" border="2px solid #FFBE00" borderRadius="lg" bg="" p="4">
                      <SectionTitle mt="0">{t('Logística fora da rede AppJusto')}</SectionTitle>
                      <Text mt="2">
                        {t(
                          `Não foi possível encontrar entregadores disponíveis na nossa rede. Um entregador de outra rede já está a caminho para retirar o pedido. A equipe AppJusto está monitorando o pedido e concluirá o mesmo após a realização da entrega.`
                        )}
                      </Text>
                      {/*<Text mt="2">
                        {t(
                          `O AppJusto não terá como monitorar o pedido a partir daqui. Caso seja necessário, entre em contato com o cliente para mantê-lo informado sobre sua entrega.`
                        )}
                      </Text>
                      <Text mt="4">
                        {t(`Após a realização da entrega, confirme com o botão abaixo:`)}
                      </Text>
                      <Button
                        mt="2"
                        onClick={() => //({ status: 'delivered' })}
                        isLoading={updateResult.isLoading}
                      >
                        {t('Confirmar que o pedido foi entregue ao cliente')}
                        </Button>*/}
                    </Box>
                  ) : (
                    <Box mt="4" border="2px solid #FFBE00" borderRadius="lg" bg="" p="4">
                      <SectionTitle mt="0">{t('Assumir logística')}</SectionTitle>
                      <Text mt="2">
                        {t(
                          `Ao assumir a logística de entrega, iremos repassar o valor de ${deliveryFare} pelo custo da entrega, além do valor do pedido que já foi cobrado do cliente. O AppJusto não terá como monitorar o pedido a partir daqui.`
                        )}
                      </Text>
                      <HStack mt="4">
                        <Button
                          mt="0"
                          variant="dangerLight"
                          onClick={() => setIsOutsourceDelivery(false)}
                        >
                          {t('Cancelar')}
                        </Button>
                        <Button
                          mt="0"
                          onClick={() => getOutsourceDelivery()}
                          isLoading={outsourceDeliveryResult.isLoading}
                        >
                          {t('Confirmar')}
                        </Button>
                      </HStack>
                    </Box>
                  )
                ) : (
                  <DeliveryInfos order={order} setOutsource={setIsOutsourceDelivery} />
                ))}
              <OrderDetails order={order} />
              {order?.status === 'canceled' && (
                <>
                  <SectionTitle>{t('Dados do cancelamento')}</SectionTitle>
                  <Text mt="1" fontSize="md" fontWeight="700" color="black">
                    {t('Motivo:')}{' '}
                    <Text as="span" fontWeight="500">
                      {orderCancellation?.issue?.title ?? 'N/E'}
                    </Text>
                  </Text>
                  <Text mt="1" fontSize="md" fontWeight="700" color="black">
                    {t('Reembolso:')}{' '}
                    <Text as="span" fontWeight="500">
                      {orderCancellation?.params.refund.includes('products') ? 'Sim' : 'Não'}
                    </Text>
                  </Text>
                </>
              )}
              {orderIssues && orderIssues.length > 0 && <OrderIssuesTable issues={orderIssues} />}
              {order?.status !== 'ready' && order?.status !== 'dispatching' && (
                <>
                  <Text mt="8" fontSize="xl" color="black">
                    {t('Destino do pedido')}
                  </Text>
                  <Text fontSize="sm">{order?.destination?.address.description}</Text>
                </>
              )}
              {(order?.status === 'confirmed' || order?.status === 'preparing') && (
                <CookingTime
                  orderId={order.id}
                  cookingTime={order.cookingTime}
                  averageCookingTime={business?.averageCookingTime}
                />
              )}
              {(order?.status === 'delivered' || order?.status === 'canceled') && invoices && (
                <Box mt="10">
                  <CustomButton
                    size="md"
                    minW="220px"
                    variant="outline"
                    label={t('Ver fatura no Iugu')}
                    link={`https://alia.iugu.com/receive/invoices/${invoices[0]?.externalId}`}
                    isExternal
                  />
                </Box>
              )}
            </>
          )}
        </Box>
        <OrderToPrinting businessName={business?.name} order={order} ref={printComponent} />
      </Box>
      <SuccessAndErrorHandler
        submission={submission.current}
        isError={error.status}
        error={error.error}
        errorMessage={error.message}
      />
    </OrderBaseDrawer>
  );
};
