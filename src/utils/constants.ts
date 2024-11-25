// Используется для запросов данных и отправки заказа
export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;

// Используется для формирования адреса картинки в товаре
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

// Настройки для приложения
export const categorySettings: { [key: string]: string } = {
	card__category_additional: 'дополнительное',
	card__category_soft: 'софт-скил',
	card__category_other: 'другое',
	card__category_button: 'кнопка',
	card__category_hard: 'хард-скил',
};

export const PaymentMethods: { [key: string]: string } = {
	card: 'online',
	cash: 'cash',
};
