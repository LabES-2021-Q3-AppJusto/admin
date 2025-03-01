import { useObserveDashboardOrders } from 'app/api/order/useObserveDashboardOrders';
import React from 'react';
import { useContextBusinessId } from '../business/context';

interface ContextProps {
  todayOrders?: number;
  todayValue?: number;
  todayAverage?: number;
  monthOrders?: number;
  monthValue?: number;
  monthAverage?: number;
  currentWeekOrders?: number;
  currentWeekValue?: number;
  currentWeekAverage?: number;
  currentWeekProduct?: string;
  currentWeekByDay?: number[];
  lastWeekOrders?: number;
  lastWeekValue?: number;
  lastWeekByDay?: number[];
}

const BusinessDashboardContext = React.createContext<ContextProps>({} as ContextProps);

interface Props {
  children: React.ReactNode | React.ReactNode[];
}

export const BusinessDashboardProvider = ({ children }: Props) => {
  // context
  const businessId = useContextBusinessId();
  const {
    todayOrders,
    todayValue,
    todayAverage,
    monthOrders,
    monthValue,
    monthAverage,
    currentWeekOrders,
    currentWeekValue,
    currentWeekAverage,
    currentWeekProduct,
    currentWeekByDay,
    lastWeekOrders,
    lastWeekValue,
    lastWeekByDay,
  } = useObserveDashboardOrders(businessId);
  // state
  // provider
  return (
    <BusinessDashboardContext.Provider
      value={{
        todayOrders,
        todayValue,
        todayAverage,
        monthOrders,
        monthValue,
        monthAverage,
        currentWeekOrders,
        currentWeekValue,
        currentWeekAverage,
        currentWeekProduct,
        currentWeekByDay,
        lastWeekOrders,
        lastWeekValue,
        lastWeekByDay,
      }}
    >
      {children}
    </BusinessDashboardContext.Provider>
  );
};

export const useContextBusinessDashboard = () => {
  return React.useContext(BusinessDashboardContext);
};
