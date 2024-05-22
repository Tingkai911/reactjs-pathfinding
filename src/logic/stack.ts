class Stack<T> {
    private storage: T[] = [];

    constructor() {}

    push(item: T): void {
        this.storage.push(item);
    }

    pop(): T | undefined {
        return this.storage.pop();
    }

    size(): number {
        return this.storage.length;
    }
}

export default Stack;