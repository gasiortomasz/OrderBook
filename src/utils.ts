
export const testPositiveInteger =  (x: string): boolean => {
    const regex = /^\d+$/;
    return regex.test(x) && Number(x) > 0;
}

export const testOrderSide = (x: string): boolean => {
    const regex = /^(B|S)$/;
    return regex.test(x);
}

export const testPositiveFloat = (x: string): boolean => {
    const regex = /^\d+\.\d+$/;
    return (testPositiveInteger(x) || regex.test(x)) && parseFloat(x) > 0;
}

export const testRawOrder = (rawOrder: string): boolean => {
    const parsedOrder = rawOrder.split('|');
    if (parsedOrder.length !== 3) {
        return false;
    }
    const [price, quantity, side] = parsedOrder;
    return testPositiveInteger(price)
        && testPositiveFloat(quantity)
        && testOrderSide(side);
}

export const notEmptyString = (x: string) => {
    return x !== '';
}