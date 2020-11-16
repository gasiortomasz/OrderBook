import {Offers, Asks, Order} from './OrdersStorage';
import {notEmptyString, testRawOrder} from './utils';


export class OrderBook {
    private asksOrders: Asks;
    private offersOrders: Offers;
    private asksTotal: Record<number, number>;
    private offersTotal: Record<number, number>;
    private idCounter: number;

    constructor() {
        this.asksOrders = new Asks();
        this.offersOrders = new Offers();
        this.asksTotal = {};
        this.offersTotal = {};
        this.idCounter = 0;
    }

    processStream(stream: String): Array<Fill> {
        let fills: Array<Fill> = [];
        const orders = stream.split(';').filter(notEmptyString);
        for (const order of orders) {
            if (!testRawOrder(order)) {
                throw new Error(`Order '${order}' is corrupt`);
            }
            const orderFills = this.processOrder(order);
            fills = [...fills, ...orderFills];
        }
        return fills;
    }

    processOrder(order: String): Array<Fill> {
        const [rawPrice, rawQuantity, side] = order.split('|');
        const price = parseFloat(rawPrice);
        const quantity = Number(rawQuantity);

        if (side === 'B') {
            return this.processAsk(Number(price), Number(quantity));
        }
        return this.processOffer(Number(price), Number(quantity));
    }

    addAsk(price: number, quantity: number) {
        const currentQty = this.asksTotal[price] | 0;
        this.asksTotal[price] = currentQty + quantity;
        this.asksOrders.add(new Order(price, quantity, this.idCounter));
        this.idCounter++;
    }

    addOffer(price: number, quantity: number) {
        const currentQty = this.offersTotal[price] | 0;
        this.offersTotal[price] = currentQty + quantity;
        this.offersOrders.add(new Order(price, quantity, this.idCounter));
        this.idCounter++;
    }

    processAsk(price: number, quantity: number): Array<Fill>  {
        const fills: Array<Fill> = [];
        while (quantity > 0) {
            const bestOffer = this.offersOrders.getBest();
            if (!bestOffer || price < bestOffer.price) {
                this.addAsk(price, quantity);
                quantity = 0;
            }
            else { // (bestOffer.price <= price) {
                const quantityToTakeOut = Math.min(bestOffer.quantity, quantity);
                fills.push(new Fill(bestOffer.price, quantityToTakeOut, bestOffer.id));

                quantity -= quantityToTakeOut;
                this.offersTotal[bestOffer.price] -= quantityToTakeOut;
                bestOffer.quantity -= quantityToTakeOut;

                if (this.offersTotal[bestOffer.price] === 0) {
                    delete this.offersTotal[bestOffer.price];
                }
                if (bestOffer.quantity === 0) {
                    this.offersOrders.takeBest();
                }
            }
        }
        return fills;
    }

    processOffer(price: number, quantity: number): Array<Fill>  {
        const fills: Array<Fill> = [];
        while (quantity > 0) {
            const bestAsk = this.asksOrders.getBest();
            if (!bestAsk || price > bestAsk.price) {
                this.addOffer(price, quantity);
                quantity = 0;
            }
            else { // (bestAsk.price >= price) {
                const quantityToTakeOut = Math.min(bestAsk.quantity, quantity);
                fills.push(new Fill(bestAsk.price, quantityToTakeOut, bestAsk.id));

                quantity -= quantityToTakeOut;
                this.asksTotal[bestAsk.price] -= quantityToTakeOut;
                bestAsk.quantity -= quantityToTakeOut;

                if (this.asksTotal[bestAsk.price] === 0) {
                    delete this.asksTotal[bestAsk.price];
                }
                if (bestAsk.quantity === 0) {
                    this.asksOrders.takeBest();
                }
            }
        }
        return fills;
    }

    getState(): [Record<number, number>, Record<number, number>] {
        return [this.asksTotal, this.offersTotal];
    }
}

export class Fill {
    constructor(public price: number, public quantity: number, public id: number) { }
}
