import './scss/styles.scss';
import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ProductItem, ProductItemPreview, BasketCard } from './components/Card';
import { AppState } from './components/Appdata';
import { Page } from './components/Page';
import { IProductItem, IOrderInfo } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Success } from './components/common/Success';
import { Order, Contacts } from './components/common/Order';

const events = new EventEmitter();
const apiLarek = new LarekAPI(API_URL, CDN_URL);

//Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const catalogCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const appState = new AppState({}, events);

const pageContainer = new Page(document.body, events);
const modalContainer = new Modal(
	ensureElement<HTMLElement>('#modal-container'),
	events
);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contact = new Contacts(cloneTemplate(contactsTemplate), events);

events.on('catalog:updated', () => {
	pageContainer.catalog = appState.catalog.map((item) => {
		const card = new ProductItem(cloneTemplate(catalogCardTemplate), {
			onClick: () => events.emit('card:openDetails', item),
		});
		return card.render({
			id: item.id,
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
});

events.on('card:openDetails', (item: IProductItem) => {
	const card = new ProductItemPreview(cloneTemplate(previewCardTemplate), {
		onClick: () => {
			events.emit('basket:addProduct', item);
		},
	});

	modalContainer.render({
		content: card.render({
			id: item.id,
			title: item.title,
			category: item.category,
			description: item.description,
			price: item.price,
			image: item.image,
			button: appState.getCardButton(item),
		}),
	});
});

events.on('basket:addProduct', (item: IProductItem) => {
	appState.toggleBasketProduct(item);
	events.emit('basket:open');
});

events.on('basket:open', () => {
	modalContainer.render({
		content: basket.render(),
	});
});

events.on('basket:changed', () => {
	pageContainer.counter = appState.basket.length;
	basket.sum = appState.calculateTotalPrice();
	basket.items = appState.basket.map((basketCard) => {
		const newBasketCard = new BasketCard(cloneTemplate(basketCardTemplate), {
			onClick: () => {
				appState.removeCard(basketCard);
			},
		});
		newBasketCard.index = appState.getCardIndex(basketCard);
		return newBasketCard.render({
			title: basketCard.title,
			price: basketCard.price,
		});
	});
});

events.on('order:openForm', () => {
	order.clearButtonState();
	modalContainer.render({
		content: order.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on(
	'order:formUpdated',
	(data: { payment: string; button: HTMLElement }) => {
		order.switchPaymentMethod(data.button);
		appState.setOrderPayment(data.payment);
		appState.validateOrderForm();
	}
);

events.on(
	'order.address:change',
	(data: { field: keyof Pick<IOrderInfo, 'address'>; value: string }) => {
		appState.setOrderField(data.field, data.value);
	}
);

events.on('formErrors:changed', (errors: Partial<IOrderInfo>) => {
	const { email, phone, address, payment } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address })
		.filter((item) => !!item)
		.join('; ');

	contact.valid = !email && !phone;
	contact.errors = Object.values({ email, phone })
		.filter((item) => !!item)
		.join('; ');
});

events.on(
	/contacts\.(phone|email):change/,
	(data: {
		field: keyof Pick<IOrderInfo, 'phone' | 'email'>;
		value: string;
	}) => {
		appState.setOrderField(data.field, data.value);
	}
);

events.on('order:submit', () => {
	modalContainer.render({
		content: contact.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('contacts:submit', () => {
	appState.updateOrder();
	apiLarek
		.orderProducts(appState.order)
		.then((result) => {
			const successWindow = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modalContainer.closeModal();
				},
			});
			appState.clearBasket();
			appState.clearOrder();

			modalContainer.render({
				content: successWindow.render({ total: result.total }),
			});
		})
		.catch((err: any) => {
			console.error(`Ошибка выполнения заказа ${err}`);
		});
});

events.on('modal:open', () => {
	pageContainer.locked = true;
});

events.on('modal:close', () => {
	pageContainer.locked = false;
});

apiLarek
	.getProductList()
	.then(appState.setCatalogItem.bind(appState))
	.catch((err) => {
		console.error(err);
	});
