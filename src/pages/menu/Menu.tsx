import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Spacer,
  Text,
  useBreakpoint,
} from '@chakra-ui/react';
import { MenuProvider } from 'app/state/menu/menu';
import PageLayout from 'pages/PageLayout';
import React from 'react';
import { Link, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { t } from 'utils/i18n';
import { Categories } from './Categories';
import { CategoryDrawer } from './drawers/CategoryDrawer';
import { ProductDrawer } from './drawers/ProductDrawer';

const Menu = () => {
  // context
  const { path, url } = useRouteMatch();
  const history = useHistory();

  // state
  const [productSearch, setProductSearch] = React.useState('');

  // handler
  const closeDrawerHandler = () => history.replace(path);

  // UI
  const breakpoint = useBreakpoint();
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    breakpoint === 'base' ? (
      <Box p="6">{children}</Box>
    ) : (
      <Container maxW="md">{children}</Container>
    );
  return (
    <MenuProvider>
      <PageLayout>
        <Wrapper>
          <Heading fontSize="lg" mt="4">
            {t('Cardápio')}
          </Heading>
          <Text fontSize="sm">{t('Defina o cardápio do seu restaurante.')}</Text>
          <Box mt="6" d="flex">
            <Link to={`${url}/category/new`}>
              <Button>{t('Adicionar categoria')}</Button>
            </Link>

            <Link to={`${url}/product/new`}>
              <Button variant="outline" ml="2">
                {t('Adicionar produto')}
              </Button>
            </Link>
            <Spacer />
            <Input
              ml="32"
              value={productSearch}
              placeholder={t('Encontre um produto adicionado')}
              onChange={(ev) => setProductSearch(ev.target.value)}
            />
          </Box>
          <Box mt="2">
            <Categories productSearch={productSearch} />
          </Box>
        </Wrapper>
        <Switch>
          <Route path={`${path}/product/:productId`}>
            <ProductDrawer isOpen onClose={closeDrawerHandler} />
          </Route>
          <Route path={`${path}/category/:categoryId`}>
            <CategoryDrawer isOpen onClose={closeDrawerHandler} />
          </Route>
        </Switch>
      </PageLayout>
    </MenuProvider>
  );
};

export default Menu;
