import { useContextApi } from 'app/state/api/context';
import { Business, WithId } from 'appjusto-types';
import React from 'react';

export const useObserveBusinessManagedBy = (email: string | undefined | null) => {
  // contex
  const api = useContextApi();
  // state
  const [businesses, setBusinesses] = React.useState<WithId<Business>[] | undefined>();
  // side effects
  React.useEffect(() => {
    if (!email) return; // during initialization
    const unsub = api.business().observeBusinessManagedBy(email, setBusinesses);
    return () => unsub();
  }, [email, api]);
  // return
  return businesses;
};
