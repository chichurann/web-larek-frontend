import './scss/styles.scss';
import { Page } from './components/Page';
import { Api, ApiListResponse } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Modal } from './components/common/Modal';
import { StoreItem, StoreItemPreview } from './components/Card';
import { AppState, Product } from './components/Hero';
import { ensureElement, cloneTemplate } from './utils/utils';
import { ApiResponse, IOrderForm, IProduct } from './types';
import { API_URL } from './utils/constants';
import { Basket, StoreItemBasket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';

// Создание экземпляра API
const api = new Api(API_URL);
const events = new EventEmitter();

// Шаблоны компонентов
const storeProductTemplate =
	ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры для страницы и модального окна
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые компоненты
const basket = new Basket('basket', cloneTemplate(basketTemplate), events);
const order = new Order('order', cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success('order-success', cloneTemplate(successTemplate), {
	onClick: () => {
		events.emit('modal:close');
		modal.close();
	},
});

// Получение лотов с сервера
api
	.get('/product')
	.then((res: ApiResponse) => {
		appData.setStore(res.items as IProduct[]);
	})
	.catch((err) => {
		console.error('Ошибка при получении товаров:', err);
	});

// Изменение элементов каталога
events.on('items:changed', () => {
	page.store = appData.store.map((item) => {
		const product = new StoreItem(cloneTemplate(storeProductTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return product.render({
			id: item.id,
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
});

// Открытие карточки товара
events.on('card:select', (item: Product) => {
	page.locked = true;
	const product = new StoreItemPreview(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('card:toBasket', item);
		},
	});
	modal.render({
		content: product.render({
			id: item.id,
			title: item.title,
			image: item.image,
			category: item.category,
			description: item.description,
			price: item.price,
			selected: item.selected,
		}),
	});
});

// Добавление товара в корзину
events.on('card:toBasket', (item: Product) => {
	item.selected = true;
	appData.addToBasket(item);
	page.counter = appData.getBasketAmount();
	modal.close();
});

// Открытие корзины
events.on('basket:open', () => {
	page.locked = true;
	const basketItems = appData.basket.map((item, index) => {
		const storeItem = new StoreItemBasket(
			'card',
			cloneTemplate(cardBasketTemplate),
			{
				onClick: () => events.emit('basket:delete', item),
			}
		);
		return storeItem.render({
			title: item.title,
			price: item.price,
			index: index + 1,
		});
	});
	modal.render({
		content: basket.render({
			list: basketItems,
			price: appData.getTotalBasketPrice(),
		}),
	});
});

// Удалить товар из корзины
events.on('basket:delete', (item: Product) => {
	appData.deleteFromBasket(item.id);
	item.selected = false;
	basket.price = appData.getTotalBasketPrice();
	page.counter = appData.getBasketAmount();
	basket.refreshIndices();
	if (!appData.basket.length) {
		basket.disableButton();
	}
});

// Оформление заказа
events.on('basket:order', () => {
	modal.render({
		content: order.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Изменение состояния валидации заказа
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Изменение состояния валидации контактов
events.on('contactsFormErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменение введенных данных
events.on(
	'orderInput:change',
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Заполнение телефонного номера и почты
events.on('order:submit', () => {
	appData.order.total = appData.getTotalBasketPrice();
	appData.setItems();
	modal.render({
		content: contacts.render({
			valid: false,
			errors: [],
		}),
	});
});

// Покупка товаров
events.on('contacts:submit', () => {
	api
		.post('/order', appData.order)
		.then((res) => {
			events.emit('order:success', res);
			appData.clearBasket();
			appData.refreshOrder();
			order.disableButtons();
			page.counter = 0;
			appData.resetSelected();
		})
		.catch((err) => {
			console.error('Ошибка при оформлении заказа:', err);
			// Создание элемента div для отображения сообщения об ошибке
			const errorDiv = document.createElement('div');
			errorDiv.textContent =
				'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.';
			modal.render({
				content: errorDiv, // Передача элемента вместо строки
			});
		});
});

// Окно успешной покупки
events.on('order:success', (res: ApiListResponse<string>) => {
	modal.render({
		content: success.render({
			description: res.total,
		}),
	});
});

// Закрытие модального окна
events.on('modal:close', () => {
	page.locked = false;
	appData.refreshOrder();
});
