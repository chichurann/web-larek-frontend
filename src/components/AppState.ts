import { IProductItem, IAppStore, IOrderInfo, FormErrors } from '../types';
import { Model } from './base/Model';

export class AppState extends Model<IAppStore> {
	catalog: IProductItem[] = [];
	basket: IProductItem[] = [];
	preview: string | null = null;
	order: IOrderInfo = {
		total: 0,
		items: [],
		phone: '',
		email: '',
		address: '',
		payment: 'online',
	};
	formErrors: FormErrors = {};

	clearBasket() {
		this.basket = [];
		this.updateBasket();
	}

	clearOrder() {
		this.order = {
			total: 0,
			items: [],
			phone: '',
			email: '',
			address: '',
			payment: 'online',
		};
	}

	updateCatalog(items: IProductItem[]) {
		this.catalog = items;
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	showPreview(item: IProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	addToBasket(item: IProductItem) {
		if (this.basket.indexOf(item) < 0) {
			this.basket.push(item);
			this.updateBasket();
		}
	}

	removeFromBasket(item: IProductItem) {
		this.basket = this.basket.filter((it) => it != item);
		this.updateBasket();
	}

	updateBasket() {
		this.emitChanges('counter:changed', this.basket);
		this.emitChanges('basket:changed', this.basket);
	}

	setDeliveryField(
		field: keyof Pick<IOrderInfo, 'payment' | 'address'>,
		value: string
	) {
		this.order[field] = value;
		if (this.validateOrderForm()) {
			this.events.emit('delivery:ready', this.order);
		}
	}

	setContactField(
		field: keyof Pick<IOrderInfo, 'email' | 'phone'>,
		value: string
	) {
		this.order[field] = value;
		if (this.validateOrderForm()) {
			this.events.emit('contact:ready', this.order);
		}
	}

	validateOrderForm() {
		const errors: typeof this.formErrors = {};

		if (!this.order.phone) {
			errors.phone = 'Укажите номер телефона';
		}

		if (!this.order.email) {
			errors.email = 'Указать email';
		}

		if (!this.order.address) {
			errors.address = 'Укажите адрес';
		}

		if (this.order.address && !this.order.payment) {
			errors.payment = 'Выберите способ оплаты';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
