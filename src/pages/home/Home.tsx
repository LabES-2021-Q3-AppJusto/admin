import { Box, Button, Center, Flex, FormControl, Text } from '@chakra-ui/react';
import { useApi } from 'app/api/context';
import { Input } from 'common/components/Input';
import { ReactComponent as Logo } from 'common/img/logo.svg';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { t } from 'utils/i18n';

const HomeLeftImage = React.lazy(() => import(/* webpackPrefetch: true */ './img/HomeLeftImage'));
const HomeRightImage = React.lazy(() => import(/* webpackPrefetch: true */ './img/HomeRightImage'));

const Home = () => {
  // context
  const history = useHistory();
  const api = useApi();

  console.log(api);

  // refs
  const inputRef = React.useRef<HTMLInputElement>(null);

  // side effects
  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  // UI
  return (
    <Flex>
      <Box w={[0, 1 / 3]} display={['none', 'revert']}>
        <React.Suspense fallback={null}>
          <HomeLeftImage />
        </React.Suspense>
      </Box>
      <Center w={['100%', 1 / 3]}>
        <Box width="full" p="16">
          <Logo />
          <Box mt="8">
            <Text fontSize="xl">{t('Portal do Parrceiro')}</Text>
            <Text fontSize="md" color="gray.500">
              {t('Gerencie seu estabelecimento')}
            </Text>
            <Box mt="4">
              <FormControl isRequired>
                <Input
                  ref={inputRef}
                  id="email"
                  label={t('E-mail')}
                  placeholder={t('Endereço de e-mail')}
                />
              </FormControl>
            </Box>
            <Button width="full" mt="6" onClick={() => history.push('/menu')}>
              {t('Entrar')}
            </Button>
          </Box>
        </Box>
      </Center>
      <Box w={[0, 1 / 3]} display={['none', 'revert']}>
        <React.Suspense fallback={null}>
          <HomeRightImage />
        </React.Suspense>
      </Box>
    </Flex>
  );
};

export default Home;
