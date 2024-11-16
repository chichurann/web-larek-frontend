import {
	IProductItem,
	IAppStore,
	IOrderInfo,
	TOrderField,
	FormErrors,
} from '../types';
import { Model } from './base/Model';

export class AppState extends Model<IAppStore> {
	catalog: IProductItem[] = [];
	basket: IProductItem[] = [];
	preview: string | null;
	order: IOrderInfo = {
		total: 0,
		items: [],
		email: '',
		phone: '',
		address: '',
		payment: '',
	};

	formErrors: FormErrors = {};

	setCatalogItem(items: IProductItem[]) {
		items.forEach((item) => this.catalog.push(item));
		this.emitChanges('catalog:updated', { catalog: this.catalog });
	}

	setPreview(item: IProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	getCardButton(item: IProductItem) {
		if (item.price === null) {
			return 'addToBasket';
		}
		if (!this.basket.some((card) => card.id === item.id)) {
			return 'addToBasket';
		} else {
			return 'removeFromBasket';
		}
	}

	checkInBasket(item: IProductItem): boolean {
		return this.basket.some((card) => card.id === item.id);
	}

	toggleBasketProduct(item: IProductItem) {
		return !this.basket.some((card) => card.id === item.id)
			? this.addItemToBasket(item)
			: this.removeCard(item);
	}

	addItemToBasket(item: IProductItem) {
		this.basket = [...this.basket, item];
		this.emitChanges('basket:changed');
	}

	removeCard(item: IProductItem) {
		this.basket = this.basket.filter((card) => card.id !== item.id);
		this.emitChanges('basket:changed');
	}

	getCardIndex(item: IProductItem) {
		return Number(this.basket.indexOf(item)) + 1;
	}

	clearOrder() {
		this.order = {
			total: 0,
			items: [],
			email: '',
			phone: '',
			address: '',
			payment: '',
		};
	}

	clearBasket() {
		this.basket = [];
		this.emitChanges('basket:changed');
	}

	updateOrder() {
		this.order.items = this.basket.map((card) => card.id);
		this.order.total = this.calculateTotalPrice();
	}

	calculateTotalPrice() {
		return this.basket.reduce((total, card) => total + card.price, 0);
	}

	setOrderPayment(value: string) {
		this.order.payment = value;
	}

	setOrderPhone(value: string) {
		this.order.phone = value;
	}

	setOrderEmail(value: string) {
		this.order.email = value;
	}
	setOrderAddress(value: string) {
		this.order.address = value;
	}

	setOrderField(field: keyof TOrderField, value: string) {
		this.order[field] = value;
		this.validateOrderForm();
	}

	validateOrderForm() {
		const errors: typeof this.formErrors = {};

		const addressCheck = new RegExp(
			['^[', 'A-Za-zА-Яа-я0-9', '\\s,.-', ']{10,}$'].join('')
		);

		const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		const phoneCheck = new RegExp(
			['^\\+7', '\\(\\d{3}\\)', '\\d{3}-\\d{2}-\\d{2}$'].join('')
		);

		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		} else if (!emailCheck.test(this.order.email)) {
			errors.email = 'Некорректный формат email';
		}

		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else if (!phoneCheck.test(this.order.phone)) {
			errors.phone =
				'Некорректный формат телефона, введите в формате +7(ХХХ)ХХХ-ХХ-ХХ';
		}

		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		} else if (!addressCheck.test(this.order.address)) {
			errors.address =
				'Некорректный формат адреса, введите не менее 10 символов';
		}

		if (!this.order.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:changed', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
