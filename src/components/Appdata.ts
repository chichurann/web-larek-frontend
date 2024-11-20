import {
  IProductItem,
  IAppStore,
	AllOrderField,
  IOrderInfo,
  FormErrors,
} from '../types';
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
		payment: '',
  };
  formErrors: FormErrors = {};

  updateCatalog(items: IProductItem[]) {
    this.catalog.push(...items);
    this.emitChanges('catalog:updated', { catalog: this.catalog });
  }

  showPreview(item: IProductItem) {
    this.preview = item.id;
    this.emitChanges('preview:changed', item);
  }

  getProductButton(item: IProductItem): string {
    if (item.price === null || !this.isProductInCart(item)) {
      return 'addToBasket';
    }
    return 'removeFromBasket';
  }

  isProductInCart(item: IProductItem): boolean {
    return this.basket.some((card) => card.id === item.id);
  }

  toggleBasketProduct(item: IProductItem) {
    if (this.isProductInCart(item)) {
      return this.deleteCard(item);
    }
    return this.addProductToCart(item);
  }

  addProductToCart(item: IProductItem) {
    this.basket.push(item);
    this.emitChanges('basket:changed');
  }

  deleteCard(item: IProductItem) {
    this.basket = this.basket.filter((card) => card.id !== item.id);
    this.emitChanges('basket:changed');
  }

  getCardIndex(item: IProductItem): number {
    return this.basket.indexOf(item) + 1;
  }

  clearOrder() {
    this.order = {
      total: 0,
      items: [],
			phone: '',
      email: '',
			payment: '',
      address: '',
    };
  }

  clearBasket() {
    this.basket = [];
    this.emitChanges('basket:changed');
  }

  updateOrder() {
		this.order.total = this.computeTotalPrice();
    this.order.items = this.basket.map((card) => card.id);
  }

  computeTotalPrice(): number {
    return this.basket.reduce((total, card) => total + (card.price || 0), 0);
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

  setOrderField(field: keyof AllOrderField, value: string) {
    if (this.order.hasOwnProperty(field)) {
			this.validateOrderForm();
      this.order[field] = value;
    }
  }

  validateOrderForm() {
    const errors: typeof this.formErrors = {};

    const addressCheck = new RegExp('^[A-Za-zА-Яа-я0-9\\s,.-]{10,}$');
    const phoneCheck = new RegExp('^\\+7\\(\\d{3}\\)\\d{3}-\\d{2}-\\d{2}$');
		const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!this.order.phone) {
      errors.phone = 'Необходимо указать телефон';
    } else if (!phoneCheck.test(this.order.phone)) {
      errors.phone = 'Некорректный формат телефона, введите в формате +7(ХХХ)ХХХ-ХХ-ХХ';
    }

    if (!this.order.email) {
      errors.email = 'Необходимо указать email';
    } else if (!emailCheck.test(this.order.email)) {
      errors.email = 'Некорректный формат email';
    }

		if (!this.order.payment) {
      errors.payment = 'Необходимо указать способ оплаты';
    }

    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес';
    } else if (!addressCheck.test(this.order.address)) {
      errors.address = 'Некорректный формат адреса, введите не менее 10 символов';
    }

    this.formErrors = errors;
    this.events.emit('formErrors:changed', this.formErrors);
    return Object.keys(errors).length === 0;
  }
}
