import React from 'react';
import { MenuConfig } from 'appjusto-types';

export interface StateProps {
  name: string;
  categoryId: string | undefined;
  description?: string;
  price: number;
  classifications: string[];
  imageUrl?: string | undefined;
  previewURL?: string | undefined;
  externalId?: string;
  enabled: boolean;
  complementsOrder: MenuConfig | undefined;
}

export type Actions = { type: 'update_state'; payload: Partial<StateProps> };

export const productReducer = (state: StateProps, action: Actions): StateProps => {
  switch (action.type) {
    case 'update_state':
      return {
        ...state,
        ...action.payload,
      };
    default:
      throw new Error();
  }
};
