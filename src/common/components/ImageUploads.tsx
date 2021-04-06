import { Box, BoxProps, Flex, Tooltip } from '@chakra-ui/react';
import { CloseButton } from 'common/components/buttons/CloseButton';
import { CroppedAreaProps } from 'common/components/ImageCropping';
import React from 'react';
import { getCompressedImage, getCroppedImg } from 'utils/functions';
import { t } from 'utils/i18n';
import { AlertError } from './AlertError';
import { FileDropzone } from './FileDropzone';
import { ImageCropping } from './ImageCropping';

interface Props extends BoxProps {
  width: number | string | undefined;
  height: number | string | undefined;
  imageUrl?: string | null;
  ratios: number[];
  resizedWidth: number[];
  placeholderText?: string;
  getImages(files: File[]): void;
  clearDrop(): void;
}

const initError = { status: false, message: { title: '', description: '' } };

export const ImageUploads = React.memo(
  ({
    width,
    height,
    imageUrl,
    ratios,
    resizedWidth,
    placeholderText,
    getImages,
    clearDrop,
    ...props
  }: Props) => {
    // state
    const [croppedAreas, setCroppedAreas] = React.useState<CroppedAreaProps[]>([]);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [error, setError] = React.useState(initError);
    const imageExists = React.useRef(false);
    // handlers
    const handleCrop = React.useCallback((index: number, croppedArea: CroppedAreaProps) => {
      setCroppedAreas((prevState) => {
        const newAreas = [...prevState];
        newAreas[index] = croppedArea;
        return newAreas;
      });
    }, []);

    const onDropHandler = React.useCallback(
      async (acceptedFiles: File[]) => {
        const [file] = acceptedFiles;
        if (!file)
          return setError({
            status: true,
            message: {
              title: 'Formato de arquivo inválido.',
              description: 'As imagens devem estar nos formatos jpeg ou png.',
            },
          });
        if (error.status) setError(initError);
        const url = URL.createObjectURL(file);
        const preview = (await getCompressedImage(url)) as string;
        imageExists.current = false;
        setPreviewUrl(preview);
      },
      [error.status]
    );

    const clearDroppedImages = () => {
      imageExists.current = false;
      setPreviewUrl(null);
      clearDrop();
    };
    React.useEffect(() => {
      if (imageUrl) {
        imageExists.current = true;
        setPreviewUrl(imageUrl);
        setCroppedAreas([]);
      } else {
        imageExists.current = false;
        setPreviewUrl(null);
      }
    }, [imageUrl]);

    React.useEffect(() => {
      if (croppedAreas.length > 0 && previewUrl) {
        const getImageFiles = async (areas: CroppedAreaProps[]) => {
          let files = [] as File[];
          areas.forEach(async (area, index: number) => {
            try {
              const file = await getCroppedImg(
                previewUrl as string,
                area,
                ratios[index],
                resizedWidth[index]
              );
              files.push(file as File);
            } catch (error) {
              console.log('forEach Error', error);
              return null;
            }
          });
          return getImages(files);
        };
        getImageFiles(croppedAreas);
      }
    }, [croppedAreas, previewUrl, getImages, ratios, resizedWidth]);

    if (imageExists.current && previewUrl) {
      return (
        <Box w="100%">
          <FileDropzone
            onDropFile={onDropHandler}
            preview={previewUrl}
            width={width}
            height={height}
            placeholderText={placeholderText}
            {...props}
          />
          {error.status && (
            <AlertError
              title={error.message.title}
              description={error.message.description}
              maxW={width}
            />
          )}
        </Box>
      );
    }

    if (previewUrl) {
      return (
        <Box w="100%">
          <Flex flexDir="column" alignItems="flex-end" maxW={width} {...props}>
            <Tooltip label={t('Escolher outra imagem')}>
              <CloseButton mb={2} size="xs" onClick={clearDroppedImages} />
            </Tooltip>
          </Flex>
          <Box w="100%" position="relative">
            {ratios.map((ratio, index) => (
              <ImageCropping
                key={ratio}
                mt={4}
                index={index}
                image={previewUrl}
                ratio={ratio}
                width={width}
                height={height}
                onCropEnd={handleCrop}
                position={index > 0 ? 'absolute' : 'relative'}
                top={index > 0 ? '0' : undefined}
                left={index > 0 ? '0' : undefined}
                zIndex={index > 0 ? '100' : '999'}
                opacity={index > 0 ? '0' : '1'}
              />
            ))}
          </Box>
        </Box>
      );
    }
    return (
      <Box w="100%">
        <FileDropzone
          onDropFile={onDropHandler}
          preview={previewUrl}
          width={width}
          height={height}
          placeholderText={placeholderText}
          {...props}
        />
        {error.status && (
          <AlertError
            title={error.message.title}
            description={error.message.description}
            maxW={width}
          />
        )}
      </Box>
    );
  }
);
