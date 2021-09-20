import { useContextFirebaseUser } from 'app/state/auth/context';
import { Business, WithId } from 'appjusto-types';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React from 'react';
import { useBusinessProfile } from './useBusinessProfile';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const useBusinessOpenClose = (business?: WithId<Business> | null) => {
  // context
  const { isBackofficeUser } = useContextFirebaseUser();
  const { updateBusinessProfile } = useBusinessProfile();
  // side effects
  React.useEffect(() => {
    if (isBackofficeUser) return;
    if (business?.situation !== 'approved') return;
    if (!business?.schedules) return;
    const openCloseInterval = setInterval(() => {
      const today = new Date();
      const dayIndex = today.getDay() - 1;
      const daySchedule = business.schedules[dayIndex];
      let n = 0;
      let shouldBeOpen = false;
      while (daySchedule.schedule.length > n && shouldBeOpen === false) {
        const period = daySchedule.schedule[n];
        const startH = parseInt(period.from.slice(0, 2));
        const startM = parseInt(period.from.slice(2, 4));
        const endH = parseInt(period.to.slice(0, 2));
        const endM = parseInt(period.to.slice(2, 4));
        shouldBeOpen =
          dayjs().hour(startH).minute(startM).isSameOrBefore(today) &&
          dayjs().hour(endH).minute(endM).isSameOrAfter(today);
        n++;
      }
      if (shouldBeOpen && business?.status === 'closed') {
        updateBusinessProfile({ status: 'open' });
      } else if (!shouldBeOpen && business?.status === 'open') {
        updateBusinessProfile({ status: 'closed' });
      }
    }, 15000);
    return () => clearInterval(openCloseInterval);
  }, [
    isBackofficeUser,
    business?.situation,
    business?.status,
    business?.schedules,
    updateBusinessProfile,
  ]);
};
