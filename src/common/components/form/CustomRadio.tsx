import { Center, Flex, HStack, Radio, RadioProps } from '@chakra-ui/react';

const CustomRadio = ({ children, w, h, mt, mb, isDisabled, ...props }: RadioProps) => {
  // props
  const containerProps = { w, h, mt, mb };
  const mainColor = isDisabled ? 'gray.500' : 'green.500';
  // UI
  return (
    <HStack {...containerProps}>
      <Center
        border="2px solid"
        borderColor={isDisabled ? 'gray.400' : 'black'}
        position="relative"
        w="24px"
        h="24px"
        borderRadius="12px"
        boxShadow="none"
        overflow="hidden"
      >
        <Radio
          cursor={!isDisabled ? 'pointer' : 'not-allowed'}
          size="lg"
          boxShadow="none"
          bgColor="white"
          borderColor="white"
          isDisabled={isDisabled}
          _checked={{ bgColor: mainColor, outline: 'none' }}
          _disabled={{}}
          {...props}
        />
      </Center>
      <Flex h="100%" alignItems="center">
        {children}
      </Flex>
    </HStack>
  );
};

export default CustomRadio;
