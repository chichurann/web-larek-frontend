export type EventName = string | RegExp;
export type Subscriber = Function;
export type EmitterEvent = {
	eventName: string;
	data: unknown;
};

export interface IEvents {
	on<T extends object>(event: EventName, callback: (data: T) => void): void;
	emit<T extends object>(event: string, data?: T): void;
	trigger<T extends object>(
		event: string,
		context?: Partial<T>
	): (data: T) => void;
}

export interface IBasketDetails {
	products: HTMLElement[];
	totalAmount: number;
	selectedIds: string[];
}

export interface IActions {
	onClick: (event: MouseEvent) => void;
}

export interface ILarekApi {
	getProductList: () => Promise<IProductItem[]>;
	getProductItem: (id: string) => Promise<IProductItem>;
	orderProducts: (order: IOrderInfo) => Promise<IOrderResult>;
}

export type CatalogChangeEvent = {
	catalog: IProductItem[];
};

export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface ICard extends IProductItem {
	index?: string;
	buttonTitle?: string;
}

export interface IOrderInfo {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IAppStore {
	list: IProductItem[];
	preview: string | null;
	basket: IProductItem[];
	order: IOrderInfo | null;
}

export type CategoryType =
	| 'другое'
	| 'дополнительное'
	| 'софт-скил'
	| 'хард-скил'
	| 'кнопка';

export interface IModal {
	isOpen: boolean;
	openModal(data?: any): void;
	closeModal(): void;
	render(element: HTMLElement): void;
}

export type PaymentType = 'онлайн' | 'при получении';

export type PaymentDetailsForm = Pick<IOrderInfo, 'payment' | 'address'>;

export type ContactDetailsForm = Pick<IOrderInfo, 'email' | 'phone'>;

export type FormErrors = Partial<Record<keyof IOrderInfo, string>>;

export interface IOrderResult {
	id: string;
	total: number;
}

export interface IForm {
	valid: boolean;
	errors: string[];
}

export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export interface IModalData {
	content: HTMLElement;
}

export interface ISuccess {
	total: number;
}
export interface ISuccessHandler {
	onClick: () => void;
}
