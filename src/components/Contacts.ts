import { IEvents } from './base/events';
import { Form } from './common/Form';

/*
  * Интерфейс, описывающий окошко контакты
  * */
export interface IContacts {
  // Телефон
  phone: string;

  // Электронная почта
  email: string;
}

 
export class Contacts extends Form<IContacts> {
   constructor(
    container: HTMLFormElement,
    events: IEvents
  ) {
    super(container, events);
  }
}
