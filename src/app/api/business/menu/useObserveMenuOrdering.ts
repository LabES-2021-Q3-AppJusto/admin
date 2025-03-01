import * as menu from 'app/api/business/menu/functions';
import { useContextApi } from 'app/state/api/context';
import { Ordering } from 'appjusto-types';
import { isEmpty } from 'lodash';
import React from 'react';

export const useObserveMenuOrdering = (businessId: string | undefined) => {
  const api = useContextApi();
  //state
  const [productsOrdering, setProductsOrdering] = React.useState<Ordering>(menu.empty());
  const [complementsOrdering, setComplementsOrdering] = React.useState<Ordering>(menu.empty());
  const updateProductsOrdering = (ordering: Ordering) => {
    setProductsOrdering(ordering); // optimistic update to avoid flickering
    api.business().updateMenuOrdering(businessId!, ordering);
  };
  const updateComplementsOrdering = (ordering: Ordering) => {
    setComplementsOrdering(ordering); // optimistic update to avoid flickering
    api.business().updateMenuOrdering(businessId!, ordering, 'complements');
  };
  // side effects
  React.useEffect(() => {
    if (!businessId) return;
    const unsub = api.business().observeMenuOrdering(businessId, (config) => {
      setProductsOrdering(!isEmpty(config) ? config : menu.empty());
    });
    const unsub2 = api.business().observeMenuOrdering(
      businessId,
      (config) => {
        setComplementsOrdering(!isEmpty(config) ? config : menu.empty());
      },
      'complements'
    );
    return () => {
      unsub();
      unsub2();
    };
  }, [api, businessId]);
  // result
  return {
    productsOrdering,
    updateProductsOrdering,
    complementsOrdering,
    updateComplementsOrdering,
  };
};
