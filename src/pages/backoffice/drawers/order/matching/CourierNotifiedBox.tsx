import { Box, Flex, HStack, Text } from '@chakra-ui/react';
import { DispatchingStatus } from 'appjusto-types/order/dispatching';
import { CustomButton } from 'common/components/buttons/CustomButton';
import { Textarea } from 'common/components/form/input/Textarea';
import React from 'react';
import { t } from 'utils/i18n';
interface CourierNotifiedBoxProps {
  isOrderActive: boolean;
  orderId: string;
  courierId: string;
  issue?: string;
  dispatchingStatus?: DispatchingStatus;
  removeCourier(courierId: string): void;
  allocateCourier(courierId: string, comment: string): void;
  courierRemoving?: string | null;
  isLoading?: boolean;
}

export const CourierNotifiedBox = ({
  isOrderActive,
  courierId,
  issue,
  dispatchingStatus,
  removeCourier,
  allocateCourier,
  courierRemoving,
  isLoading = false,
}: CourierNotifiedBoxProps) => {
  // state
  const [isAllocating, setIsAllocating] = React.useState(false);
  const [comment, setComment] = React.useState('');
  // helpers
  const shortId = courierId.substring(0, 7) + '...';
  // side effects
  React.useEffect(() => {
    if (dispatchingStatus === 'matched' || dispatchingStatus === 'confirmed')
      setIsAllocating(false);
  }, [dispatchingStatus]);
  // UI
  return (
    <Box p="3" border="1px solid #ECF0E3" borderRadius="lg" bg="white">
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Text>{!isAllocating ? shortId : courierId}</Text>
          {issue && <Text>{issue}</Text>}
        </Box>
        <HStack>
          <CustomButton
            mt="0"
            size="sm"
            w="120px"
            h="36px"
            label={t('Ver cadastro')}
            link={`/backoffice/couriers/${courierId}`}
            variant="outline"
          />
          {!isAllocating && (
            <>
              <CustomButton
                mt="0"
                size="sm"
                w="120px"
                h="36px"
                label={t('Remover')}
                variant="danger"
                isDisabled={
                  !isOrderActive ||
                  dispatchingStatus === 'matched' ||
                  dispatchingStatus === 'confirmed'
                }
                isLoading={isLoading && courierRemoving === courierId}
                onClick={() => removeCourier!(courierId)}
              />
              <CustomButton
                mt="0"
                size="sm"
                w="120px"
                h="36px"
                label={t('Alocar')}
                isDisabled={
                  !isOrderActive ||
                  dispatchingStatus === 'matched' ||
                  dispatchingStatus === 'confirmed' ||
                  dispatchingStatus === 'outsourced'
                }
                isLoading={isLoading && !courierRemoving}
                onClick={() => setIsAllocating(true)}
              />
            </>
          )}
        </HStack>
      </Flex>
      {isAllocating && (
        <Box mt="4">
          <Text fontSize="lg">{t('Informe o motivo da alocação:')}</Text>
          <Textarea mt="2" value={comment} onChange={(e) => setComment(e.target.value)} />
          <Flex mt="4" justifyContent="flex-end">
            <CustomButton
              mt="0"
              size="sm"
              h="36px"
              label={t('Cancelar')}
              variant="dangerLight"
              onClick={() => setIsAllocating(false)}
            />
            <CustomButton
              mt="0"
              ml="4"
              size="sm"
              h="36px"
              label={t('Confirmar alocação')}
              isDisabled={
                !isOrderActive ||
                dispatchingStatus === 'matched' ||
                dispatchingStatus === 'confirmed' ||
                !comment
              }
              isLoading={isLoading && !courierRemoving}
              onClick={() => allocateCourier(courierId, comment)}
            />
          </Flex>
        </Box>
      )}
    </Box>
  );
};
