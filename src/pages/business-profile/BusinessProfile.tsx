import { Box, Text, useBreakpoint } from '@chakra-ui/react';
import { useBusinessProfile } from 'app/api/business/profile/useBusinessProfile';
import { useContextBusiness } from 'app/state/business/context';
import { CurrencyInput } from 'common/components/form/input/currency-input/CurrencyInput2';
import { CustomInput as Input } from 'common/components/form/input/CustomInput';
import { CustomTextarea as Textarea } from 'common/components/form/input/CustomTextarea';
import { CustomPatternInput as PatternInput } from 'common/components/form/input/pattern-input/CustomPatternInput';
import { cnpjFormatter, cnpjMask } from 'common/components/form/input/pattern-input/formatters';
import { numbersOnlyParser } from 'common/components/form/input/pattern-input/parsers';
import { ImageUploads } from 'common/components/ImageUploads';
import {
  coverRatios,
  coverResizedWidth,
  logoRatios,
  logoResizedWidth,
} from 'common/imagesDimensions';
import { OnboardingProps } from 'pages/onboarding/types';
import PageFooter from 'pages/PageFooter';
import PageHeader from 'pages/PageHeader';
import React from 'react';
import { useQueryCache } from 'react-query';
import { Redirect } from 'react-router-dom';
import { t } from 'utils/i18n';
import { CuisineSelect } from '../../common/components/form/select/CuisineSelect';

const BusinessProfile = ({ onboarding, redirect }: OnboardingProps) => {
  // context
  const business = useContextBusiness();
  const queryCache = useQueryCache();
  // state
  const [name, setName] = React.useState(business?.name ?? '');
  const [cnpj, setCNPJ] = React.useState(business?.cnpj ?? '');
  const [cuisineName, setCuisineName] = React.useState(business?.cuisine ?? '');
  const [description, setDescription] = React.useState(business?.description ?? '');
  const [minimumOrder, setMinimumOrder] = React.useState(business?.minimumOrder ?? 0);
  const [logoExists, setLogoExists] = React.useState(false);
  const [coverExists, setCoverExists] = React.useState(false);
  const [logoFiles, setLogoFiles] = React.useState<File[] | null>(null);
  const [coverFiles, setCoverFiles] = React.useState<File[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  // refs
  const nameRef = React.useRef<HTMLInputElement>(null);
  // queries & mutations
  const {
    updateBusinessProfile,
    logo,
    cover,
    uploadLogo,
    uploadCover,
    result,
  } = useBusinessProfile();
  const { isSuccess } = result;
  // handlers
  const onSubmitHandler = async () => {
    setIsLoading(true);
    if (logoFiles) await uploadLogo(logoFiles[0]);
    if (coverFiles) await uploadCover(coverFiles);
    await updateBusinessProfile({
      name,
      cnpj,
      description,
      minimumOrder,
      cuisine: cuisineName,
      logoExists: logoExists,
      coverImageExists: coverExists,
    });
    if (logoFiles) queryCache.invalidateQueries(['business:logo', business?.id]);
    if (coverFiles) queryCache.invalidateQueries(['business:cover', business?.id]);
    return setIsLoading(false);
  };

  const clearDropImages = React.useCallback((type: string) => {
    if (type === 'logo') {
      setLogoExists(false);
      setLogoFiles(null);
    } else {
      setCoverExists(false);
      setCoverFiles(null);
    }
  }, []);

  const getLogoFiles = React.useCallback(async (files: File[]) => {
    setLogoExists(true);
    setLogoFiles(files);
  }, []);

  const getCoverFiles = React.useCallback(async (files: File[]) => {
    setCoverFiles(files);
    setCoverExists(true);
  }, []);

  // side effects
  React.useEffect(() => {
    nameRef?.current?.focus();
  }, []);
  React.useEffect(() => {
    if (business) {
      if (business.name) setName(business.name);
      if (business.cnpj) setCNPJ(business.cnpj);
      if (business.description) setDescription(business.description);
      if (business.minimumOrder) setMinimumOrder(business.minimumOrder);
      if (business.cuisine) setCuisineName(business.cuisine);
      if (business.logoExists && logo) setLogoExists(true);
      if (business.coverImageExists && cover) setCoverExists(true);
    }
  }, [business, cover, logo]);

  // UI
  const breakpoint = useBreakpoint();
  if (isSuccess && redirect) return <Redirect to={redirect} push />;
  return (
    <Box maxW="464px">
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          onSubmitHandler();
        }}
      >
        <PageHeader
          title={t('Sobre o restaurante')}
          subtitle={t('Essas informações serão vistas por seus visitantes')}
        />
        <Input
          isRequired
          id="business-name"
          ref={nameRef}
          label={t('Nome')}
          placeholder={t('Nome')}
          value={name}
          onChange={(ev) => setName(ev.target.value)}
        />
        <PatternInput
          isRequired
          id="business-cnpj"
          label={t('CNPJ')}
          placeholder={t('CNPJ do seu estabelecimento')}
          mask={cnpjMask}
          parser={numbersOnlyParser}
          formatter={cnpjFormatter}
          value={cnpj}
          onValueChange={(value) => setCNPJ(value)}
          validationLength={14}
        />
        <CuisineSelect
          isRequired
          value={cuisineName}
          onChange={(ev) => setCuisineName(ev.target.value)}
        />
        <Textarea
          isRequired
          id="business-description"
          label={t('Descrição')}
          placeholder={t('Descreva seu restaurante')}
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
        />
        <CurrencyInput
          isRequired
          id="business-min-price"
          label={t('Valor mínimo do pedido')}
          placeholder={t('R$ 0,00')}
          value={minimumOrder}
          onChangeValue={(value) => setMinimumOrder(value)}
          maxLength={8}
        />
        {/* logo */}
        <Text mt="8" fontSize="xl" color="black">
          {t('Logo do estabelecimento')}
        </Text>
        <Text mt="2" fontSize="md">
          {t(
            'Para o logo do estabelecimento recomendamos imagens no formato quadrado (1:1) com no mínimo 200px de largura'
          )}
        </Text>
        <ImageUploads
          key="logo"
          mt="4"
          width="200px"
          height="200px"
          imageUrl={logo}
          ratios={logoRatios}
          resizedWidth={logoResizedWidth}
          getImages={getLogoFiles}
          clearDrop={() => clearDropImages('logo')}
        />
        {/* cover image */}
        <Text mt="8" fontSize="xl" color="black">
          {t('Imagem de capa')}
        </Text>
        <Text mt="2" fontSize="md">
          {t(
            'Você pode ter também uma imagem de capa para o seu restaurante. Pode ser foto do local ou de algum prato específico. Recomendamos imagens na proporção retangular (16:9) com no mínimo 1280px de largura'
          )}
        </Text>
        <ImageUploads
          key="cover"
          mt="4"
          width={breakpoint === 'base' ? 328 : breakpoint === 'md' ? 420 : 464}
          imageUrl={cover}
          ratios={coverRatios}
          resizedWidth={coverResizedWidth}
          getImages={getCoverFiles}
          clearDrop={() => clearDropImages('cover')}
        />
        {/* submit */}
        <PageFooter
          onboarding={onboarding}
          redirect={redirect}
          isLoading={isLoading}
          onSubmit={onSubmitHandler}
        />
      </form>
    </Box>
  );
};

export default BusinessProfile;
