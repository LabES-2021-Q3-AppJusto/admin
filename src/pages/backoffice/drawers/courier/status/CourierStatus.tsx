import { Box, CheckboxGroup, Flex, RadioGroup, Text, Textarea, VStack } from '@chakra-ui/react';
import { useContextCourierProfile } from 'app/state/courier/context';
import { ProfileSituation } from 'appjusto-types';
import { AlertError } from 'common/components/AlertError';
import CustomCheckbox from 'common/components/form/CustomCheckbox';
import CustomRadio from 'common/components/form/CustomRadio';
import React from 'react';
import { t } from 'utils/i18n';
import { SectionTitle } from '../../generics/SectionTitle';

export const CourierStatus = () => {
  // context
  const { courier, issueOptions, marketPlace, handleProfileChange } = useContextCourierProfile();
  // state
  const [financialIssues, setFinancialIssues] = React.useState<string[]>([]);
  // side effects
  React.useEffect(() => {
    if (marketPlace?.issues) setFinancialIssues(marketPlace.issues);
  }, [marketPlace?.issues]);

  // UI
  return (
    <Box>
      {financialIssues.length > 0 && (
        <AlertError
          title={t('Problemas identificados na verificação financeira:')}
          icon={false}
          border="2px solid #DC3545"
          mb="6"
        >
          <VStack mt="2" spacing={1} alignItems="flex-start">
            {financialIssues.map((issue) => (
              <Text key={issue}>* {t(`${issue}`)}</Text>
            ))}
          </VStack>
        </AlertError>
      )}
      <SectionTitle mt="0">{t('Alterar status do entregador:')}</SectionTitle>
      <RadioGroup
        mt="2"
        onChange={(value: ProfileSituation) => handleProfileChange('situation', value)}
        value={courier?.situation ?? 'pending'}
        defaultValue="1"
        colorScheme="green"
        color="black"
        fontSize="15px"
        lineHeight="21px"
      >
        <Flex flexDir="column" justifyContent="flex-start">
          <CustomRadio mt="2" value="approved" isDisabled={courier?.situation !== 'verified'}>
            {t('Publicado')}
          </CustomRadio>
          <CustomRadio mt="2" value="rejected">
            {t('Recusado')}
          </CustomRadio>
          <CustomRadio mt="2" value="submitted">
            {t('Aguardando aprovação')}
          </CustomRadio>
          <CustomRadio mt="2" value="blocked">
            {t('Bloquear entregador')}
          </CustomRadio>
        </Flex>
      </RadioGroup>
      {courier?.situation === 'rejected' && (
        <>
          <SectionTitle>{t('Motivo da recusa:')}</SectionTitle>
          <CheckboxGroup
            colorScheme="green"
            value={courier?.profileIssues ?? []}
            onChange={(value) => handleProfileChange('profileIssues', value)}
          >
            <VStack alignItems="flex-start" mt="4" color="black" spacing={2}>
              {issueOptions?.map((issue) => (
                <CustomCheckbox key={issue.id} value={issue.title}>
                  {issue.title}
                </CustomCheckbox>
              ))}
            </VStack>
          </CheckboxGroup>
          <SectionTitle>{t('Mensagem personalizada:')}</SectionTitle>
          <Textarea
            mt="2"
            value={courier?.profileIssuesMessage ?? ''}
            onChange={(ev) => handleProfileChange('profileIssuesMessage', ev.target.value)}
          />
        </>
      )}
    </Box>
  );
};
