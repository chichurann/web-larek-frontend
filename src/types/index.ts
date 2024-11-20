export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	button: string;
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

export interface ISettings {
	categorySettings: Record<CategoryType, string>;
}

export interface IModal {
	isOpen: boolean;
	openModal(data?: any): void;
	closeModal(): void;
	render(element: HTMLElement): void;
}

 export type PaymentType = 'онлайн' | 'при получении';

 export type PaymentDetailsForm = Pick<IOrderInfo, 'payment' | 'address'>;

 export type ContactDetailsForm = Pick<IOrderInfo, 'email' | 'phone'>;

export type AllOrderField = ContactDetailsForm & PaymentDetailsForm;

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
