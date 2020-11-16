import {expect} from 'chai';
import {testPositiveInteger, testPositiveFloat, testOrderSide, testRawOrder} from '../src/utils';

describe("Stream Parsing", () => {
    describe("Positive integer", () => {
        it('1', () => {
            const x = '1'
            expect(testPositiveInteger(x)).to.be.true;
        });
        it('0', () => {
            const x = '0'
            expect(testPositiveInteger(x)).to.be.false;
        });
        it('01', () => {
            const x = '01'
            expect(testPositiveInteger(x)).to.be.true;
        });
        it('-1', () => {
            const x = '-1'
            expect(testPositiveInteger(x)).to.be.false;
        });
        it('+1', () => {
            const x = '+1'
            expect(testPositiveInteger(x)).to.be.false;
        });
        it('12321321', () => {
            const x = '12321321'
            expect(testPositiveInteger(x)).to.be.true;
        });
    })

    describe("Positive Float", () => {
        it('1', () => {
            const x = '1'
            expect(testPositiveFloat(x)).to.be.true;
        });
        it('0', () => {
            const x = '0'
            expect(testPositiveFloat(x)).to.be.false;
        });
        it('01', () => {
            const x = '01'
            expect(testPositiveFloat(x)).to.be.true;
        });
        it('-1', () => {
            const x = '-1'
            expect(testPositiveFloat(x)).to.be.false;
        });
        it('+1', () => {
            const x = '+1'
            expect(testPositiveFloat(x)).to.be.false;
        });
        it('12321321', () => {
            const x = '12321321'
            expect(testPositiveFloat(x)).to.be.true;
        });
        it('0.0', () => {
            const x = '0.0'
            expect(testPositiveFloat(x)).to.be.false;
        });
        it('0.0', () => {
            const x = '0.0'
            expect(testPositiveFloat(x)).to.be.false;
        });
    })

})