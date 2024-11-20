import './scss/styles.scss';
import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { IProductItem, IOrderInfo } from './types';
import { ProductItem, ProductItemPreview, BasketCard } from './components/Card';
import { AppState } from './components/Appdata';
import { ensureElement, cloneTemplate } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Order, Contacts } from './components/common/Order';
import { Basket } from './components/common/Basket';
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

eventEmitter.on('catalog:updated', () => {
  mainPageContainer.catalog = appState.catalog.map((product) => {
    const card = new ProductItem(cloneTemplate(productCardTemplate), {
      onClick: () => eventEmitter.emit('card:openDetails', product),
    });
    return card.render({
      id: product.id,
      title: product.title,
      category: product.category,
      image: product.image,
      price: product.price,
    });
  });
});

eventEmitter.on('card:openDetails', (product: IProductItem) => {
  const previewCard = new ProductItemPreview(cloneTemplate(previewCardTemplate), {
    onClick: () => {
      eventEmitter.emit('basket:addProduct', product);
    },
  });

  modalWindow.render({
    content: previewCard.render({
      id: product.id,
      title: product.title,
      description: product.description,
      image: product.image,
      category: product.category,
      price: product.price,
      button: appState.getProductButton(product),
    }),
  });
});

eventEmitter.on('basket:addProduct', (product: IProductItem) => {
  appState.toggleBasketProduct(product);
  eventEmitter.emit('basket:open');
});

eventEmitter.on('basket:open', () => {
  modalWindow.render({
    content: shoppingBasket.render(),
  });
});

eventEmitter.on('basket:changed', () => {
  mainPageContainer.counter = appState.basket.length;
  shoppingBasket.sum = appState.computeTotalPrice();
  shoppingBasket.items = appState.basket.map((basketItem) => {
    const newBasketCard = new BasketCard(cloneTemplate(basketCardTemplate), {
      onClick: () => {
        appState.deleteCard(basketItem);
      },
    });
    newBasketCard.index = appState.getCardIndex(basketItem);
    return newBasketCard.render({
      price: basketItem.price,
      title: basketItem.title,
    });
  });
});

eventEmitter.on('order:openForm', () => {
  orderForm.clearButtonState();
  modalWindow.render({
    content: orderForm.render({
      address: '',
      valid: false,
      errors: [],
    }),
  });
});

eventEmitter.on(
  'order:formUpdated',
  (data: { payment: string; button: HTMLElement }) => {
    orderForm.switchPaymentMethod(data.button);
    appState.validateOrderForm();
    appState.setOrderPayment(data.payment);
  }
);

eventEmitter.on(
  'order.address:change',
  (data: { field: keyof Omit<IOrderInfo, 'total' | 'items'>; value: string }) => {
    appState.setOrderField(data.field, data.value);
  }
);

eventEmitter.on('formErrors:changed', (errors: Partial<IOrderInfo>) => {
  const { email, phone, address, payment } = errors;
  orderForm.valid = !payment && !address;
  orderForm.errors = Object.values({ payment, address })
    .filter((item) => !!item)
    .join('; ');

  contactInfo.valid = !email && !phone;
  contactInfo.errors = Object.values({ email, phone })
    .filter((item) => !!item)
    .join('; ');
});

eventEmitter.on(
  /contacts\.(phone|email):change/,
  (data: { field: keyof Pick<IOrderInfo, 'phone' | 'email'>; value: string }) => {
    appState.setOrderField(data.field, data.value);
  }
);

eventEmitter.on('order:submit', () => {
  modalWindow.render({
    content: contactInfo.render({
      email: '',
      phone: '',
      valid: false,
      errors: [],
    }),
  });
});

eventEmitter.on('contacts:submit', () => {
  appState.updateOrder();
  apiService
    .orderProducts(appState.order)
    .then((result) => {
      const successWindow = new Success(cloneTemplate(successTemplate), {
        onClick: () => {
          modalWindow.closeModal();
        },
      });
      appState.clearOrder();
      appState.clearBasket();

      modalWindow.render({
        content: successWindow.render({ total: result.total }),
      });
    })
    .catch((err: any) => {
      console.error(`Ошибка выполнения заказа ${err}`);
    });
});

eventEmitter.on('modal:open', () => {
  mainPageContainer.locked = true;
});

eventEmitter.on('modal:close', () => {
  mainPageContainer.locked = false;
});

apiService
  .getProductList()
  .then(appState.updateCatalog.bind(appState))
  .catch((err) => {
    console.error(err);
  });
