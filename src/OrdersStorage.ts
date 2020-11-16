import {Heap} from 'typescript-collections';
import {ICompareFunction} from 'typescript-collections/dist/lib/util';


export class Order {
    constructor(public price: number, public quantity: number, public id: number) { }
}

class OrdersStorage {
    protected heap: Heap<Order>;
    constructor(cmp: ICompareFunction<Order>) {
        this.heap = new Heap<Order>(cmp);
    }

    add(order: Order) {
        this.heap.add(order);
    }

    getBest(): Order | undefined {
        return this.heap.peek();
    }

    takeBest(): Order | undefined {
        return this.heap.removeRoot();
    }
}

export class Offers extends OrdersStorage {
    constructor() {
        super(offersComparator)
    }
}

export class Asks extends OrdersStorage {
    constructor() {
        super(asksComparator)
    }
}

const minPrice: ICompareFunction<Order> = (a, b) => {
    if (a.price < b.price) {
        return -1;
    }
    return 1;
};

const minId: ICompareFunction<Order> = (a, b) => {
    if (a.id < b.id) {
        return -1;
    }
    return 1;
};

const offersComparator: ICompareFunction<Order> = (a, b) => {
    if (a.price === b.price) {
        return minId(a, b);
    }
    return minPrice(a, b);
};

const asksComparator: ICompareFunction<Order> = (a, b) => {
    if (a.price === b.price) {
        return minId(a, b);
    }
    return -1 * minPrice(a, b);
};