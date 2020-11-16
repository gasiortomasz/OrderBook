import {expect} from 'chai';
import {Offers, Asks, Order} from '../src/OrdersStorage';

describe("UNIT: OrderBook", () => {
    let offers: Offers;
    let asks: Asks;
    const orders = [
        new Order(102, 1, 1),
        new Order(103, 1, 2),
        new Order(102, 1, 3),
        new Order(100, 1, 4),
        new Order(103, 1, 5)
    ];

    beforeEach(() => {
        offers = new Offers();
        asks = new Asks();
    });

    it('Offers', () => {
        orders.forEach(order => offers.add(order));

        expect(offers.getBest()).to.deep.equal(orders[3]);
        expect(offers.takeBest()).to.deep.equal(orders[3]);
        expect(offers.takeBest()).to.deep.equal(orders[0]);
        expect(offers.takeBest()).to.deep.equal(orders[2]);
        expect(offers.takeBest()).to.deep.equal(orders[1]);
        expect(offers.takeBest()).to.deep.equal(orders[4]);
        expect(offers.takeBest()).to.deep.equal(undefined);
    });

    it('Asks', () => {
        orders.forEach(order => asks.add(order));

        expect(asks.getBest()).to.deep.equal(orders[1]);
        expect(asks.takeBest()).to.deep.equal(orders[1]);
        expect(asks.takeBest()).to.deep.equal(orders[4]);
        expect(asks.takeBest()).to.deep.equal(orders[0]);
        expect(asks.takeBest()).to.deep.equal(orders[2]);
        expect(asks.takeBest()).to.deep.equal(orders[3]);
        expect(asks.takeBest()).to.deep.equal(undefined);
    });
});
