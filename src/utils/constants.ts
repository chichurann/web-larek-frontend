// Используется для запросов данных и отправки заказа
export const API_URL = `https://larek-api.nomoreparties.co/api/weblarek`;

// Используется для формирования адреса картинки в товаре
export const CDN_URL = `https://larek-api.nomoreparties.co/content/weblarek`;

// Настройки для приложения
export const categorySettings: { [key: string]: string } = {
	дополнительное: 'card__category_additional',
	'софт-скил': 'card__category_soft',
	другое: 'card__category_other',
	кнопка: 'card__category_button',
	'хард-скил': 'card__category_hard',
};

export const PaymentMethods: { [key: string]: string } = {
	card: 'online',
	cash: 'cash',
};
