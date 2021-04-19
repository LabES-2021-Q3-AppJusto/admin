import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch/lite';
import { AlgoliaConfig, Environment } from 'appjusto-types';
import { BusinessesFilter, SearchKind, SituationFilter } from './types';

export default class SearchApi {
  private client: SearchClient;
  private businesses: SearchIndex;
  private couriers: SearchIndex;
  private consumers: SearchIndex;
  private orders: SearchIndex;

  constructor(config: AlgoliaConfig, env: Environment) {
    this.client = algoliasearch(config.appId, config.apiKey);
    this.businesses = this.client.initIndex(`${env}_businesses_backoffice`);
    this.couriers = this.client.initIndex(`${env}_couriers_backoffice`);
    this.consumers = this.client.initIndex(`${env}_consumers`);
    this.orders = this.client.initIndex(`${env}_orders_backoffice`);
  }

  private getSearchIndex(kind: SearchKind) {
    if (kind === 'businesses') return this.businesses;
    else if (kind === 'couriers') return this.couriers;
    else if (kind === 'consumers') return this.consumers;
    else if (kind === 'orders') return this.orders;
  }

  private createBusinessesFilters(filters?: BusinessesFilter[]) {
    return filters
      ?.reduce<string[]>((result, filter) => {
        if (filter.type === 'enabled') {
          return [...result, `enabled: ${filter.value}`];
        } else if (filter.type === 'situation') {
          return [...result, `situation: ${filter.value}`];
        }
        return result;
      }, [])
      .join(' OR ');
  }

  businessSearch<T>(
    kind: SearchKind,
    filters: BusinessesFilter[],
    query: string = '',
    page?: number,
    hitsPerPage?: number
  ) {
    const index = this.getSearchIndex(kind);
    if (!index) throw new Error('Invalid index');
    return index.search<T>(query, {
      page,
      hitsPerPage,
      filters: this.createBusinessesFilters(filters),
    });
  }

  private createSituationFilters(filters?: SituationFilter[]) {
    return filters
      ?.reduce<string[]>((result, filter) => {
        if (filter.type === 'situation') {
          return [...result, `situation: ${filter.value}`];
        }
        return result;
      }, [])
      .join(' OR ');
  }

  basicUserSearch<T>(
    kind: SearchKind,
    filters: SituationFilter[],
    query: string = '',
    page?: number,
    hitsPerPage?: number
  ) {
    const index = this.getSearchIndex(kind);
    if (!index) throw new Error('Invalid index');
    return index.search<T>(query, {
      page,
      hitsPerPage,
      filters: this.createSituationFilters(filters),
    });
  }
}
