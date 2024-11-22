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
  isPayButtonEnabled: boolean = false;
  isNextButtonEnabled: boolean = false;

  updateCatalog(items: IProductItem[]) {
    this.catalog.push(...items);
    this.emitChanges('catalog:updated', { catalog: this.catalog });
  }

  showPreview(item: IProductItem) {
    this.preview = item.id;
    this.emitChanges('preview:changed', item);
  }

  getProductButton(item: IProductItem): string {
    return this.isProductInCart(item) ? 'removeFromBasket' : 'addToBasket';
  }

  isProductInCart(item: IProductItem): boolean {
    return this.basket.some((card) => card.id === item.id);
  }

  toggleBasketProduct(item: IProductItem) {
    if (this.isProductInCart(item)) {
      this.deleteCard(item);
    } else {
      this.addProductToCart(item);
    }
  }

  addProductToCart(item: IProductItem) {
    this.basket.push(item);
    this.emitChanges('basket:changed');
    this.updateOrder();
  }

  deleteCard(item: IProductItem) {
    this.basket = this.basket.filter((card) => card.id !== item.id);
    this.emitChanges('basket:changed');
    this.updateOrder();
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
      address: '',
      payment: '',
    };
    this.updateNextButtonState();
    this.updatePayButtonState();
  }

  clearBasket() {
    this.basket = [];
    this.emitChanges('basket:changed');
    this.updateOrder();
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
    this.updateNextButtonState();
    this.updatePayButtonState();
  }

  setOrderPhone(value: string) {
    this.order.phone = value;
    this.updatePayButtonState();
  }

  setOrderEmail(value: string) {
    this.order.email = value;
    this.updatePayButtonState();
  }

  setOrderAddress(value: string) {
    this.order.address = value;
    this.updateNextButtonState();
  }

  setOrderField(field: keyof AllOrderField, value: string) {
    if (this.order.hasOwnProperty(field)) {
      this.order[field] = value;
      this.validateOrderForm();
      this.updateNextButtonState();
      this.updatePayButtonState();
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
    this.events.emit('formErrors:changed', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  updatePayButtonState() {
    this.isPayButtonEnabled = !!this.order.phone && !!this.order.email;
    this.events.emit('payButton:stateChanged', { isEnabled: this.isPayButtonEnabled });
  }

  updateNextButtonState() {
    this.isNextButtonEnabled = !!this.order.payment && !!this.order.address;
    this.events.emit('nextButton:stateChanged', { isEnabled: this.isNextButtonEnabled });

    if (this.order.address && !this.order.payment) {
      this.formErrors.payment = 'Выберите способ оплаты';
      this.events.emit('formErrors:changed', this.formErrors);
    } else {
      delete this.formErrors.payment;
      this.events.emit('formErrors:changed', this.formErrors);
    }
  }
}
