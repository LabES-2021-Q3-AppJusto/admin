import firebase from 'firebase/app';
import { documentsAs } from '../utils';
import { Bank, Cuisine } from 'appjusto-types';

export default class PlatformApi {
  constructor(
    private firestore: firebase.firestore.Firestore,
    private functions: firebase.functions.Functions
  ) {}

  // private helpers
  private getPlatformRef() {
    return this.firestore.collection('platform');
  }
  private getBusinessRef() {
    return this.getPlatformRef().doc('business');
  }
  private getCuisinesRef() {
    return this.getBusinessRef().collection('cuisines');
  }
  private getBanksRef() {
    return this.firestore.collection('banks');
  }

  // public
  // firestore
  async fetchCuisines() {
    return documentsAs<Cuisine>((
      await this.getCuisinesRef().get()
    ).docs);
  }

  async fetchBanks() {
    return documentsAs<Bank>((
      await this.getBanksRef().get()
    ).docs);
  }
}
