import './scss/styles.scss';
import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL, PaymentMethods } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { IProductItem, IOrderInfo, CatalogChangeEvent } from './types';
import { Card } from './components/Card';
import { AppState } from './components/AppState';
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
const modalWindow = new Modal(
	ensureElement<HTMLElement>('#modal-container'),
	eventEmitter
);
const shoppingBasket = new Basket(cloneTemplate(basketTemplate), eventEmitter);
const contactInfo = new Contacts(cloneTemplate(contactsTemplate), eventEmitter);
const orderForm = new Order(cloneTemplate(orderTemplate), eventEmitter, {
	onClick: (ev: Event) => eventEmitter.emit('payment:toggle', ev.target),
});

const successWindow = new Success(cloneTemplate(successTemplate), {
	onClick: () => {
		modalWindow.closeModal();
	},
});

eventEmitter.on<CatalogChangeEvent>('items:changed', () => {
	mainPageContainer.catalog = appState.catalog.map((item) => {
		const card = new Card(cloneTemplate(productCardTemplate), {
			onClick: () => eventEmitter.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		});
	});
});

eventEmitter.on('card:select', (item: IProductItem) => {
	appState.showPreview(item);
});

eventEmitter.on('preview:changed', (item: IProductItem) => {
	const card = new Card(cloneTemplate(previewCardTemplate), {
		onClick: () => {
			eventEmitter.emit('product:toggle', item);
			card.buttonTitle =
				appState.basket.indexOf(item) < 0 ? 'Купить' : 'Удалить из корзины';
		},
	});
	modalWindow.render({
		content: card.render({
			title: item.title,
			description: item.description,
			image: item.image,
			price: item.price,
			category: item.category,
			buttonTitle:
				appState.basket.indexOf(item) < 0 ? 'Купить' : 'Удалить из корзины',
		}),
	});
});

eventEmitter.on('product:toggle', (item: IProductItem) => {
	if (appState.basket.indexOf(item) < 0) {
		eventEmitter.emit('product:add', item);
	} else {
		eventEmitter.emit('product:delete', item);
	}
});

eventEmitter.on('product:add', (item: IProductItem) => {
	appState.addToBasket(item);
});

eventEmitter.on('product:delete', (item: IProductItem) =>
	appState.removeFromBasket(item)
);

eventEmitter.on('basket:changed', (items: IProductItem[]) => {
	shoppingBasket.items = items.map((item, index) => {
		const card = new Card(cloneTemplate(basketCardTemplate), {
			onClick: () => {
				eventEmitter.emit('product:delete', item);
			},
		});
		return card.render({
			index: (index + 1).toString(),
			title: item.title,
			price: item.price,
		});
	});
	const total = items.reduce((total, item) => total + item.price, 0);
	shoppingBasket.sum = total;
	appState.order.total = total;
	shoppingBasket.toggleButton(total === 0);
});

eventEmitter.on('counter:changed', () => {
	mainPageContainer.counter = appState.basket.length;
});

eventEmitter.on('basket:open', () => {
	modalWindow.render({
		content: shoppingBasket.render({}),
	});
});

eventEmitter.on('order:openForm', () => {
	modalWindow.render({
		content: orderForm.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
	appState.order.items = appState.basket.map((item) => item.id);
});

eventEmitter.on('payment:toggle', (target: HTMLElement) => {
	if (!target.classList.contains('button_alt-active')) {
		orderForm.toggleButtons();
		appState.order.payment = PaymentMethods[target.getAttribute('name')];
	}
});

eventEmitter.on('formErrors:change', (errors: Partial<IOrderInfo>) => {
	const { payment, address, email, phone } = errors;
	orderForm.valid = !payment && !address;
	contactInfo.valid = !email && !phone;
	orderForm.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
	contactInfo.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

eventEmitter.on(
	/^order\..*:change/,
	(data: {
		field: keyof Pick<IOrderInfo, 'payment' | 'address'>;
		value: string;
	}) => {
		appState.setDeliveryField(data.field, data.value);
	}
);

eventEmitter.on(
	/^contacts\..*:change/,
	(data: {
		field: keyof Pick<IOrderInfo, 'email' | 'phone'>;
		value: string;
	}) => {
		appState.setContactField(data.field, data.value);
	}
);

eventEmitter.on('delivery:ready', () => {
	orderForm.valid = true;
});

eventEmitter.on('contact:ready', () => {
	contactInfo.valid = true;
});

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
	apiService
		.orderProducts(appState.order)
		.then((result) => {
			appState.clearBasket();
			appState.clearOrder();
			successWindow.total = result.total.toString();
			modalWindow.render({
				content: successWindow.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
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
