import { FormControl, FormLabel, Input, InputProps, useMultiStyleConfig } from '@chakra-ui/react';
import i18n from 'i18n-js';
import React from 'react';

interface Props extends InputProps {
  id: string;
  label?: string;
  onChangeValue: (value: number) => void;
}

export const CurrencyInput = ({
  id,
  mt,
  mb,
  mr,
  ml,
  flex,
  value,
  label,
  onChangeValue: onValueChange,
  ...props
}: Props) => {
  //props
  const controlProps = { mt, mb, mr, ml, flex };
  // context
  const valueAsNumber = (value as number) ?? 0;
  const valueAsString = i18n.toCurrency(valueAsNumber);
  // state
  const [priceText, setPriceText] = React.useState(valueAsString);

  // side effects
  React.useEffect(() => {
    // keep internal state in sync with value received
    setPriceText(valueAsString);
  }, [valueAsString]);

  // UI
  const styles = useMultiStyleConfig('CustomInput', {});
  return (
    <FormControl id={id} sx={styles.control} {...controlProps}>
      {label && <FormLabel sx={styles.label}>{label}</FormLabel>}
      <Input
        value={priceText}
        onChange={(ev) => setPriceText(ev.target.value)}
        onFocus={() =>
          setPriceText(
            valueAsNumber === 0
              ? ''
              : i18n.toNumber(valueAsNumber, { separator: ',', precision: 2 })
          )
        }
        onBlur={() => {
          const sanitizedPrice = priceText.replace(',', '.');
          const newPriceAsNumber = parseFloat(sanitizedPrice);
          const newPrice = !isNaN(newPriceAsNumber) ? newPriceAsNumber : valueAsNumber;
          onValueChange(newPrice);
          setPriceText(i18n.toCurrency(newPrice));
        }}
        sx={styles.input}
        {...props}
      />
    </FormControl>
  );
};
