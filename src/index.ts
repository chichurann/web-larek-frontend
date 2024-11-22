import './scss/styles.scss';
import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { IProductItem, IOrderInfo } from './types';
import { ProductItem, ProductItemPreview, BasketCard } from './components/Card';
import { AppState } from './components/Appdata';
import { ensureElement, cloneTemplate } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Order, Contacts } from './components/Order';
import { Basket } from './components/Basket';
import { Page } from './components/Page';
import { Success } from './components/common/Success';

const apiService = new LarekAPI(API_URL, CDN_URL);
const eventEmitter = new EventEmitter();

const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const productCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');

const appState = new AppState({}, eventEmitter);
const mainPageContainer = new Page(document.body, eventEmitter);
const modalWindow = new Modal(ensureElement<HTMLElement>('#modal-container'), eventEmitter);

const shoppingBasket = new Basket(cloneTemplate(basketTemplate), eventEmitter);
const contactInfo = new Contacts(cloneTemplate(contactsTemplate), eventEmitter);
const orderForm = new Order(cloneTemplate(orderTemplate), eventEmitter);

const successWindow = new Success(cloneTemplate(successTemplate), {
  onClick: () => {
    modalWindow.closeModal();
  },
});

class AppPresenter {
  private model: AppState;
  private view: Page;
  private modal: Modal;
  private eventEmitter: EventEmitter;

  constructor(model: AppState, view: Page, modal: Modal, eventEmitter: EventEmitter) {
    this.model = model;
    this.view = view;
    this.modal = modal;
    this.eventEmitter = eventEmitter;

    this.initialize();
  }

  private initialize() {
    this.eventEmitter.on('catalog:updated', this.onCatalogUpdated.bind(this));
    this.eventEmitter.on('card:openDetails', this.onCardOpenDetails.bind(this));
    this.eventEmitter.on('basket:addProduct', this.onBasketAddProduct.bind(this));
    this.eventEmitter.on('basket:removeProduct', this.onBasketRemoveProduct.bind(this));
    this.eventEmitter.on('basket:open', this.onBasketOpen.bind(this));
    this.eventEmitter.on('basket:changed', this.onBasketChanged.bind(this));
    this.eventEmitter.on('order:openForm', this.onOrderOpenForm.bind(this));
    this.eventEmitter.on('order:formUpdated', this.onOrderFormUpdated.bind(this));
    this.eventEmitter.on('order.address:change', this.onOrderAddressChange.bind(this));
    this.eventEmitter.on('formErrors:changed', this.onFormErrorsChanged.bind(this));
    this.eventEmitter.on('contacts.phone:change', this.onContactsChange.bind(this));
    this.eventEmitter.on('contacts.email:change', this.onContactsChange.bind(this));
    this.eventEmitter.on('order:submit', this.onOrderSubmit.bind(this));
    this.eventEmitter.on('contacts:submit', this.onContactsSubmit.bind(this));
    this.eventEmitter.on('modal:open', this.onModalOpen.bind(this));
    this.eventEmitter.on('modal:close', this.onModalClose.bind(this));
  }

  private onCatalogUpdated() {
    this.view.catalog = this.model.catalog.map((product) => {
      const card = new ProductItem(cloneTemplate(productCardTemplate), {
        onClick: () => this.eventEmitter.emit('card:openDetails', product),
      });
      return card.render({
        id: product.id,
        title: product.title,
        category: product.category,
        image: product.image,
        price: product.price,
      });
    });
  }

  private onCardOpenDetails(product: IProductItem) {
    const previewCard = new ProductItemPreview(cloneTemplate(previewCardTemplate), {
      onClick: () => {
        this.eventEmitter.emit('basket:addProduct', product);
      },
    });

    this.modal.render({
      content: previewCard.render({
        id: product.id,
        title: product.title,
        description: product.description,
        image: product.image,
        category: product.category,
        price: product.price,
        button: this.model.getProductButton(product),
      }),
    });

    const currentButton = document.querySelector(`.card__button[data-id="${product.id}"]`) as HTMLButtonElement;
    if (currentButton) {
      this.updateButtonText(product);
    }
  }

  private onBasketAddProduct(product: IProductItem) {
    this.model.toggleBasketProduct(product);
    this.updateButtonText(product);
  }

  private onBasketRemoveProduct(product: IProductItem) {
    this.model.toggleBasketProduct(product);
    this.updateButtonText(product);
  }

  private onBasketOpen() {
    this.modal.render({
      content: shoppingBasket.render(),
    });
  }

  private onBasketChanged() {
    this.view.counter = this.model.basket.length;
    shoppingBasket.sum = this.model.computeTotalPrice();
    shoppingBasket.items = this.model.basket.map((basketItem) => {
      const newBasketCard = new BasketCard(cloneTemplate(basketCardTemplate), {
        onClick: () => {
          this.model.deleteCard(basketItem);
        },
      });
      newBasketCard.index = this.model.getCardIndex(basketItem);
      return newBasketCard.render({
        price: basketItem.price,
        title: basketItem.title,
      });
    });
  }

  private onOrderOpenForm() {
    orderForm.clearButtonState();
    this.modal.render({
      content: orderForm.render({
        address: '',
        valid: false,
        errors: [],
      }),
    });
  }

  private onOrderFormUpdated(data: { payment: string; button: HTMLElement }) {
    orderForm.switchPaymentMethod(data.button);
    this.model.setOrderPayment(data.payment);
    this.model.validateOrderForm();
  }

  private onOrderAddressChange(data: { field: keyof Omit<IOrderInfo, 'total' | 'items'>; value: string }) {
    this.model.setOrderField(data.field, data.value);
  }

  private onFormErrorsChanged(errors: Partial<IOrderInfo>) {
    const { email, phone, address, payment } = errors;
    orderForm.valid = !payment && !address;
    orderForm.errors = Object.values({ payment, address })
      .filter((item) => !!item)
      .join('; ');

    contactInfo.valid = !email && !phone;
    contactInfo.errors = Object.values({ email, phone })
      .filter((item) => !!item)
      .join('; ');
  }

  private onContactsChange(data: { field: keyof Pick<IOrderInfo, 'phone' | 'email'>; value: string }) {
    this.model.setOrderField(data.field, data.value);
  }

  private onOrderSubmit() {
    this.modal.render({
      content: contactInfo.render({
        email: '',
        phone: '',
        valid: false,
        errors: [],
      }),
    });
  }

  private onContactsSubmit() {
    this.model.updateOrder();
    apiService.orderProducts(this.model.order)
      .then((result) => {
        this.model.clearOrder();
        this.model.clearBasket();

        this.modal.render({
          content: successWindow.render({ total: result.total }),
        });
      })
      .catch((err: any) => {
        console.error(`Ошибка выполнения заказа ${err}`);
      });
  }

  private onModalOpen() {
    this.view.locked = true;
  }

  private onModalClose() {
    this.view.locked = false;
  }

  private updateButtonText(product: IProductItem) {
    const buttons = document.querySelectorAll<HTMLButtonElement>(`.card__button[data-id="${product.id}"]`);
    buttons.forEach(button => {
      button.textContent = this.model.isProductInCart(product) ? 'Убрать из корзины' : 'Добавить в корзину';
    });
  }
}

const presenter = new AppPresenter(appState, mainPageContainer, modalWindow, eventEmitter);

apiService
  .getProductList()
  .then(appState.updateCatalog.bind(appState))
  .catch((err) => {
    console.error(err);
  });
