import {expect} from 'chai';
import {OrderBook, Fill} from '../src/OrderBook';

describe("UNIT: OrderBook", () => {
    let orderBook: OrderBook;

    beforeEach(() => {
        orderBook = new OrderBook();
    });

    it('Empty Stream', () => {
        const fills = orderBook.processStream('');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({});
        expect(offers).to.deep.equal({});
        expect(fills).to.deep.equal([]);
    });

    it('1 Ask', () => {
        const fills = orderBook.processStream('100|1|B');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({100: 1});
        expect(offers).to.deep.equal({});
        expect(fills).to.deep.equal([]);
    });

    it('1 Offer', () => {
        const fills = orderBook.processStream('100|1|S');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({});
        expect(offers).to.deep.equal({100: 1});
        expect(fills).to.deep.equal([]);
    });

    it('1 Offer 1 Buy', () => {
        const fills = orderBook.processStream('100|1|S;98|1|B');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({98: 1});
        expect(offers).to.deep.equal({100: 1});
        expect(fills).to.deep.equal([]);
    });

    it('2 stacked Offers', () => {
        const fills = orderBook.processStream('100|1|S;100|2|S');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({});
        expect(offers).to.deep.equal({100: 3});
        expect(fills).to.deep.equal([]);
    });

    it('2 Offers 2 Buys', () => {
        const fills = orderBook.processStream('100|1|S;102|2|S;98|4|B;96|4|B');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({98: 4, 96: 4});
        expect(offers).to.deep.equal({100: 1, 102: 2});
        expect(fills).to.deep.equal([]);
    });

    it('Simple cross', () => {
        const fills = orderBook.processStream('100|1|S;100|1|B');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({});
        expect(offers).to.deep.equal({});
        expect(fills).to.deep.equal([new Fill(100, 1, 0)]);
    });

    it('Simple small buy cross', () => {
        const fills = orderBook.processStream('99|1|S;99|2|S;98|2|S;100|5|B');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({});
        expect(offers).to.deep.equal({});
        expect(fills).to.deep.equal([new Fill(98, 2, 2), new Fill(99, 1, 0), new Fill(99, 2, 1)]);
    });

    it('Simple small sell cross', () => {
        const fills = orderBook.processStream('111|1|B;111|2|B;120|2|B;100|5|S');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({});
        expect(offers).to.deep.equal({});
        expect(fills).to.deep.equal([new Fill(120, 2, 2), new Fill(111, 1, 0), new Fill(111, 2, 1)]);
    });

    it('Simple large buy cross', () => {
        const fills = orderBook.processStream('99|1|S;99|2|S;98|2|S;100|100|B');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({100: 95});
        expect(offers).to.deep.equal({});
        expect(fills).to.deep.equal([new Fill(98, 2, 2), new Fill(99, 1, 0), new Fill(99, 2, 1)]);
    });

    it('Simple large sell cross', () => {
        const fills = orderBook.processStream('111|1|B;111|2|B;120|2|B;100|100|S');
        const [asks, offers] = orderBook.getState();
        expect(asks).to.deep.equal({});
        expect(offers).to.deep.equal({100: 95});
        expect(fills).to.deep.equal([new Fill(120, 2, 2), new Fill(111, 1, 0), new Fill(111, 2, 1)]);
    });

    it('Assignment Task Stream', () => {
        const inputStream = '125|50|B;129|250|S;126|32|B;127|100|S;124|150|B;127|96|B;126|100|S;127|100|S;123|125|B;123|200|B;125|13|S;125|50|B;127|100|S;129|200|S';
        const correctAsks = {
            125: 87,
            124: 150,
            123: 325
        };

        const correctOffers = {
            126: 68,
            127: 204,
            129: 450
        };
        const correctFills = [new Fill(127, 96, 3), new Fill(126, 32, 2), new Fill(125, 13, 0)];

        const fills = orderBook.processStream(inputStream);
        const [asks, offers] = orderBook.getState();

        expect(asks).to.deep.equals(correctAsks);
        expect(offers).to.deep.equal(correctOffers);
        expect(fills).to.deep.equal(correctFills);
    });

    it('Fail to take out all stacked asks', () => {
        const inputStream = '100|1|B;100|1|B;100|1|B;100|2|S';
        const correctAsks = {100: 1};
        const correctOffers = {};
        const correctFills = [new Fill(100, 1, 0), new Fill(100, 1, 1)];

        const fills = orderBook.processStream(inputStream);
        const [asks, offers] = orderBook.getState();

        expect(asks).to.deep.equals(correctAsks);
        expect(offers).to.deep.equal(correctOffers);
        expect(fills).to.deep.equal(correctFills);
    });

    it('Fail to take out all stacked offers', () => {
        const inputStream = '100|1|S;100|1|S;100|1|S;100|2|B';
        const correctAsks = {};
        const correctOffers = {100: 1};
        const correctFills = [new Fill(100, 1, 0), new Fill(100, 1, 1)];

        const fills = orderBook.processStream(inputStream);
        const [asks, offers] = orderBook.getState();

        expect(asks).to.deep.equals(correctAsks);
        expect(offers).to.deep.equal(correctOffers);
        expect(fills).to.deep.equal(correctFills);
    });

    it('Take out large ask in few rounds', () => {
        const inputStream = '100|10|B;100|2|S;100|4|S;100|5|S';
        const correctAsks = {};
        const correctOffers = {100: 1};
        const correctFills = [new Fill(100, 2, 0), new Fill(100, 4, 0), new Fill(100, 4, 0)];

        const fills = orderBook.processStream(inputStream);
        const [asks, offers] = orderBook.getState();

        expect(asks).to.deep.equals(correctAsks);
        expect(offers).to.deep.equal(correctOffers);
        expect(fills).to.deep.equal(correctFills);
    });

    it('Take out large offer in few rounds', () => {
        const inputStream = '100|10|S;100|2|B;100|4|B;100|5|B';
        const correctAsks = {100: 1};
        const correctOffers = {};
        const correctFills = [new Fill(100, 2, 0), new Fill(100, 4, 0), new Fill(100, 4, 0)];

        const fills = orderBook.processStream(inputStream);
        const [asks, offers] = orderBook.getState();

        expect(asks).to.deep.equals(correctAsks);
        expect(offers).to.deep.equal(correctOffers);
        expect(fills).to.deep.equal(correctFills);
    });

    describe("Invalid Stream", () => {
        it('Negative price', () => {
            expect(() => orderBook.processStream('-1|1|B')).to.throw("Order '-1|1|B' is corrupt");
        });

        it('Zero price', () => {
            expect(() => orderBook.processStream('0|1|B')).to.throw("Order '0|1|B' is corrupt");
        });

        it('Negative quantity', () => {
            expect(() => orderBook.processStream('1|-1|B')).to.throw("Order '1|-1|B' is corrupt");
        });

        it('Zero quantity', () => {
            expect(() => orderBook.processStream('1|0|B')).to.throw("Order '1|0|B' is corrupt");
        });

        it('Invalid side', () => {
            expect(() => orderBook.processStream('1|1|b')).to.throw("Order '1|1|b' is corrupt");
        });

        it('Invalid side 2', () => {
            expect(() => orderBook.processStream('1|1|buy')).to.throw("Order '1|1|buy' is corrupt");
        });
    })
});
