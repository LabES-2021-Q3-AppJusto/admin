import { ArrowDownIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react';
import { useObserveInvoices } from 'app/api/order/useObserveInvoices';
import { IuguInvoiceStatus } from 'appjusto-types/payment/iugu';
import { FilterText } from 'common/components/backoffice/FilterText';
import { CustomDateFilter } from 'common/components/form/input/CustomDateFilter';
import { CustomInput } from 'common/components/form/input/CustomInput';
import React from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { getDateTime } from 'utils/functions';
import { t } from 'utils/i18n';
import PageHeader from '../../PageHeader';
import { InvoiceDrawer } from '../drawers/invoice';
import { InvoicesTable } from './InvoicesTable';

const InvoicesPage = () => {
  // state
  const [dateTime, setDateTime] = React.useState('');
  const [searchId, setSearchId] = React.useState('');
  const [searchFrom, setSearchFrom] = React.useState('');
  const [searchTo, setSearchTo] = React.useState('');
  const [filterBar, setFilterBar] = React.useState<IuguInvoiceStatus>();
  const [clearDateNumber, setClearDateNumber] = React.useState(0);
  // context
  const { path } = useRouteMatch();
  const history = useHistory();
  const { invoices, fetchNextPage } = useObserveInvoices(searchId, searchFrom, searchTo, filterBar);
  // handlers
  const closeDrawerHandler = () => {
    history.replace(path);
  };
  const clearFilters = () => {
    setClearDateNumber((prev) => prev + 1);
    setSearchId('');
    setSearchFrom('');
    setSearchTo('');
    setFilterBar(undefined);
  };
  // side effects
  React.useEffect(() => {
    const { date, time } = getDateTime();
    setDateTime(`${date} às ${time}`);
  }, []);

  // UI
  return (
    <Box>
      <PageHeader title={t('Faturas')} subtitle={t(`Atualizado ${dateTime}`)} />
      <Flex mt="8">
        <HStack spacing={4}>
          <CustomInput
            mt="0"
            minW="230px"
            id="search-id"
            value={searchId}
            onChange={(event) => setSearchId(event.target.value)}
            label={t('ID')}
            placeholder={t('ID do pedido')}
          />
          <CustomDateFilter
            getStart={setSearchFrom}
            getEnd={setSearchTo}
            clearNumber={clearDateNumber}
          />
        </HStack>
      </Flex>
      <Flex mt="8" w="100%" justifyContent="space-between" borderBottom="1px solid #C8D7CB">
        <HStack spacing={4}>
          <FilterText isActive={!filterBar} onClick={() => setFilterBar(undefined)}>
            {t('Todas')}
          </FilterText>
          <FilterText
            isActive={filterBar === 'in_analysis'}
            onClick={() => setFilterBar('in_analysis')}
          >
            {t('Análise')}
          </FilterText>
          <FilterText isActive={filterBar === 'pending'} onClick={() => setFilterBar('pending')}>
            {t('Pendente')}
          </FilterText>
          <FilterText isActive={filterBar === 'paid'} onClick={() => setFilterBar('paid')}>
            {t('Paga')}
          </FilterText>
          <FilterText isActive={filterBar === 'refunded'} onClick={() => setFilterBar('refunded')}>
            {t('Reembol.')}
          </FilterText>
          <FilterText isActive={filterBar === 'canceled'} onClick={() => setFilterBar('canceled')}>
            {t('Cancelada')}
          </FilterText>
          <FilterText
            isActive={filterBar === 'in_protest'}
            onClick={() => setFilterBar('in_protest')}
          >
            {t('Protesto')}
          </FilterText>
          <FilterText
            isActive={filterBar === 'chargeback'}
            onClick={() => setFilterBar('chargeback')}
          >
            {t('Estorno')}
          </FilterText>
        </HStack>
        <HStack spacing={2} color="#697667" cursor="pointer" onClick={clearFilters}>
          <DeleteIcon />
          <Text fontSize="15px" lineHeight="21px">
            {t('Limpar filtro')}
          </Text>
        </HStack>
      </Flex>
      <HStack mt="6" spacing={8} color="black">
        <Text fontSize="lg" fontWeight="700" lineHeight="26px">
          {t(`${invoices?.length ?? '0'} itens na lista`)}
        </Text>
      </HStack>
      <InvoicesTable invoices={invoices} />
      <Button mt="8" variant="secondary" onClick={fetchNextPage}>
        <ArrowDownIcon mr="2" />
        {t('Carregar mais')}
      </Button>
      <Switch>
        <Route path={`${path}/:invoiceId`}>
          <InvoiceDrawer isOpen onClose={closeDrawerHandler} />
        </Route>
      </Switch>
    </Box>
  );
};

export default InvoicesPage;
