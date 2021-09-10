import { Box, Checkbox, CheckboxGroup, Flex, Icon, Text } from '@chakra-ui/react';
import { ReactComponent as Checked } from 'common/img/icon-checked.svg';
import React from 'react';
import { t } from 'utils/i18n';
import { FinancesBaseDrawer } from './FinancesBaseDrawer';

const fakeInvoices = [
  {
    id: '1',
    value: 'R$ 48,00',
    date: '10/09/2021',
  },
  {
    id: '2',
    value: 'R$ 58,00',
    date: '10/09/2021',
  },
  {
    id: '3',
    value: 'R$ 34,50',
    date: '09/09/2021',
  },
  {
    id: '4',
    value: 'R$ 62,80',
    date: '09/09/2021',
  },
];

interface WithdrawalsDrawerProps {
  isOpen: boolean;
  onClose(): void;
}

export const WithdrawalsDrawer = ({ onClose, ...props }: WithdrawalsDrawerProps) => {
  // state
  const [selected, setSelected] = React.useState<string[]>([]);
  const [isReviewing, setIsReviewing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  // UI
  if (isSuccess) {
    return (
      <FinancesBaseDrawer
        onClose={onClose}
        title={t('Antecipação dos valores')}
        isReviewing={isReviewing}
        setIsReviewing={setIsReviewing}
        {...props}
      >
        <Flex w="100%" h="100%" flexDir="column" justifyContent="center">
          <Box>
            <Icon as={Checked} w="36px" h="36px" />
            <Text mt="2" fontSize="24px" fontWeight="500" lineHeight="30px" color="black">
              {t('Antecipação realizada com sucesso!')}
            </Text>
            <Text mt="1" fontSize="18px" fontWeight="500" lineHeight="26px">
              {t('Em até 1 dia útil o valor de R$ 000,00 estará disponível para saque.')}
            </Text>
          </Box>
        </Flex>
      </FinancesBaseDrawer>
    );
  }
  return (
    <FinancesBaseDrawer
      onClose={onClose}
      title={t('Antecipação dos valores')}
      description={t(
        'Você pode escolher individualmente os valores das pedidos que deseja antecipar. Para realizar a antecipação, será cobrada uma taxa de 0.0% + R$ 0.00 pela operação financeira. Nada desse dinheiro não ficará com o AppJusto.'
      )}
      isReviewing={isReviewing}
      setIsReviewing={setIsReviewing}
      pimaryFunc={() => setIsSuccess(true)}
      {...props}
    >
      {isReviewing ? (
        <>
          <Box mt="6">
            <Text fontSize="15px" fontWeight="500" lineHeight="21px">
              {t('Você selecionou')}
            </Text>
            <Text fontSize="24px" fontWeight="500" lineHeight="30px">
              00 pedidos
            </Text>
          </Box>
          <Box mt="6">
            <Text fontSize="15px" fontWeight="500" lineHeight="21px">
              {t('Total a adiantar')}
            </Text>
            <Text fontSize="24px" fontWeight="500" lineHeight="30px" color="green.700">
              + R$ 000,00
            </Text>
          </Box>
          <Box mt="6">
            <Text fontSize="15px" fontWeight="500" lineHeight="21px">
              {t('Total de taxas de adiantamento')}
            </Text>
            <Text fontSize="24px" fontWeight="500" lineHeight="30px" color="red">
              - R$ 000,00
            </Text>
          </Box>
          <Box mt="6" w={{ lg: '328px' }} border="1px solid #F6F6F6" borderRadius="lg" p="4">
            <Text fontSize="15px" fontWeight="500" lineHeight="21px">
              <Icon as={Checked} mr="2" />
              {t('Total a receber no adiantamento')}
            </Text>
            <Text mt="2" fontSize="36px" fontWeight="500" lineHeight="30px">
              R$ 000,00
            </Text>
          </Box>
        </>
      ) : (
        <>
          <Box w={{ lg: '328px' }} border="1px solid #F6F6F6" borderRadius="lg" p="4">
            <Text fontSize="15px" fontWeight="500" lineHeight="21px">
              <Icon as={Checked} mr="2" />
              {t('Disponível para adiantamento')}
            </Text>
            <Text mt="2" fontSize="36px" fontWeight="500" lineHeight="30px">
              R$ 000,00
            </Text>
          </Box>
          <Box mt="4">
            <CheckboxGroup
              colorScheme="green"
              value={selected}
              onChange={(values: string[]) => setSelected(values)}
            >
              {fakeInvoices.map((invoice) => (
                <Box key={invoice.id} w="100%" py="4" borderBottom="1px solid #C8D7CB">
                  <Checkbox size="lg" borderColor="black" borderRadius="lg" value={invoice.id}>
                    <Box ml="4">
                      <Text fontSize="15px" fontWeight="500" lineHeight="21px" color="black">
                        {invoice.value}
                      </Text>
                      <Text mt="2" fontSize="15px" fontWeight="500" lineHeight="21px">
                        {invoice.date}
                      </Text>
                    </Box>
                  </Checkbox>
                </Box>
              ))}
            </CheckboxGroup>
            <Text mt="4" fontSize="15px" fontWeight="700" lineHeight="21px">
              {t(`Total selecionado: R$ 0,00`)}
            </Text>
          </Box>
        </>
      )}
    </FinancesBaseDrawer>
  );
};
