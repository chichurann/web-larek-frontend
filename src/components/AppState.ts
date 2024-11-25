import {
	IProductItem,
	IAppStore,
	FormErrors,
	IOrder,
	IContact,
} from '../types';
import { Model } from './base/Model';
import { PaymentMethods } from '../utils/constants';

export class AppState extends Model<IAppStore> {
	catalog: IProductItem[] = [];
	basket: IProductItem[] = [];
	preview: string | null = null;
	order: IOrder & IContact = {
		phone: '',
		email: '',
		address: '',
		payment: '',
	};
	formErrors: FormErrors = {};

	clearBasket() {
		this.basket = [];
		this.updateBasket();
	}

	clearOrder() {
		this.order = {
			phone: '',
			email: '',
			address: '',
			payment: '',
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
		this.emitChanges('basket:changed', this.basket);
	}

	setDeliveryField(field: keyof IOrder, value: string) {
		if (field === 'payment') {
			this.order[field] = PaymentMethods[value];
		} else {
			this.order[field] = value;
		}
		this.emitChanges('order:change', { field, value });
		if (this.validateOrderForm()) {
			this.emitChanges('delivery:ready', this.order);
		}
	}

	setContactField(field: keyof IContact, value: string) {
		this.order[field] = value;
		this.emitChanges('contact:change', { field, value });
		if (this.validateOrderForm()) {
			this.emitChanges('contact:ready', this.order);
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
		this.emitChanges('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
