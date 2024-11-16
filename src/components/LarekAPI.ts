import { Api, ApiListResponse } from './base/api';
import { IOrderInfo, IProductItem, IOrderResult } from '../types';

export interface ILarekApi {
	getProductList: () => Promise<IProductItem[]>;
	getProductItem: (id: string) => Promise<IProductItem>;
	orderProducts: (order: IOrderInfo) => Promise<IOrderResult>;
}

export class LarekAPI extends Api implements ILarekApi {
	readonly cdn: string;

	constructor(baseUrl: string, cdn: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductItem(id: string): Promise<IProductItem> {
		return this.get(`/product/${id}`).then((item: IProductItem) => ({
			...item,
			image: item.image,
		}));
	}

	getProductList(): Promise<IProductItem[]> {
		return this.get('/product').then((data: ApiListResponse<IProductItem>) =>
			data.items.map((item) => ({
				...item,
				image: item.image,
			}))
		);
	}

	orderProducts(order: IOrderInfo): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
