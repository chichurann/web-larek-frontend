# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```


В данном приложении используется событийно-ориентированный подход. 
Это позволяет компонентам взаимодействовать друг с другом, реагируя на определенные события, что упрощает управление состоянием и логикой приложения.

Архитектура приложения
1. Класс Api
Назначение: Обеспечивает взаимодействие с API для получения и отправки данных.
Зона ответственности: Обработка HTTP-запросов и ответов.

Конструктор:
Параметры: baseUrl: string - базовый URL для API.

Поля:
baseUrl: string - базовый URL для всех запросов.

Методы:
get(endpoint: string): Promise<ApiResponse> - отправляет GET-запрос на указанный endpoint и возвращает ответ.
post(endpoint: string, data: any): Promise<ApiResponse> - отправляет POST-запрос на указанный endpoint с данными и возвращает ответ.

2. Класс EventEmitter
Назначение: Управляет событиями в приложении.
Зона ответственности: Позволяет компонентам общаться друг с другом через события.
Конструктор: Не принимает параметров.

Поля:
events: Record<string, Function[]> - объект, хранящий события и их обработчики.

Методы:
on(event: string, listener: Function): void - подписывает обработчик на событие.
emit(event: string, ...args: any[]): void - вызывает все обработчики для указанного события.
off(event: string, listener: Function): void - удаляет обработчик события.

3. Класс Page
Назначение: Управляет представлением страницы.
Зона ответственности: Содержит и рендерит элементы страницы.

Конструктор:
Параметры: container: HTMLElement, events: EventEmitter - контейнер для страницы и экземпляр EventEmitter.
Поля:
container: HTMLElement - корневой элемент страницы.
locked: boolean - состояние блокировки страницы.
store: HTMLElement[] - элементы, представляющие товары.

Методы:
render(): void - рендерит страницу.
set store(value: HTMLElement[]): void - обновляет элементы на странице.

4. Класс Modal
Назначение: Управляет отображением модальных окон.
Зона ответственности: Позволяет открывать и закрывать модальные окна с контентом.

Конструктор:
Параметры: container: HTMLElement, events: EventEmitter - контейнер для модального окна и экземпляр EventEmitter.
Поля:
container: HTMLElement - корневой элемент модального окна.
Методы:

render(content: HTMLElement): void - отображает модальное окно с указанным контентом.
close(): void - закрывает модальное окно.

5. Класс AppState
Назначение: Хранит состояние приложения и управляет данными.
Зона ответственности: Управляет данными о товарах, корзине и заказе.

Конструктор:
Параметры: initialState: object, events: EventEmitter - начальное состояние и экземпляр EventEmitter.

Поля:
basket: Product[] - массив товаров в корзине.
store: Product[] - массив доступных товаров.
order: IOrder - информация о текущем заказе.
formErrors: FormErrors - ошибки в формах.

Методы:
setStore(items: IProduct[]): void - устанавливает товары в хранилище.
addToBasket(product: Product): void - добавляет товар в корзину.
deleteFromBasket(id: string): void - удаляет товар из корзины.
getBasketAmount(): number - возвращает количество товаров в корзине.
getTotalBasketPrice(): number - возвращает общую сумму товаров в корзине.
setOrderField(field: keyof IOrderForm, value: string): void - устанавливает поля заказа.

6. Класс Success
Назначение: Отображает информацию о успешной покупке.
Зона ответственности: Отображает сообщение об успешной транзакции.
Конструктор:

Параметры: blockName: string, container: HTMLElement, actions?: ISuccessActions - имя блока, контейнер для рендеринга и действия по клику.
Поля:
_button: HTMLButtonElement - кнопка закрытия.
_description: HTMLElement - элемент для описания.

Методы:
set description(value: number): void - устанавливает текст описания с указанием суммы.