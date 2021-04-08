import { Box } from '@chakra-ui/react';
import { useFirebaseUserRole } from 'app/api/auth/useFirebaseUserRole';
import Image from 'common/components/Image';
import logo from 'common/img/logo.svg';
import React from 'react';
import { useRouteMatch } from 'react-router';
import { BackOfficeLinks } from './BackOfficeLinks';
import BusinessInfo from './BusinessInfo';
import { Links } from './Links';
import { ManagerBar } from './ManagerBar';

const Sidebar = () => {
  // context
  const { path } = useRouteMatch();
  const { isBackofficeUser } = useFirebaseUserRole();
  const isBackOffice = path.includes('backoffice');
  return (
    <Box
      position="relative"
      d={{ base: 'none', md: 'block' }}
      w="220px"
      bg="gray.300"
      flexShrink={0}
    >
      <Box position="fixed" top="4" w="220px" flexShrink={0}>
        <Box ml="4" mt="6">
          <Image src={logo} eagerLoading height="40px" />
        </Box>
        {isBackOffice ? (
          <BackOfficeLinks />
        ) : (
          <Box>
            <Box ml="4" mt="6">
              <BusinessInfo />
            </Box>
            <Box mt="6">
              <Links />
            </Box>
          </Box>
        )}
      </Box>
      {((!isBackOffice && !isBackofficeUser) || (isBackOffice && isBackofficeUser)) && (
        <ManagerBar />
      )}
    </Box>
  );
};

export default Sidebar;
