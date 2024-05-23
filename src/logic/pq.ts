class PriorityQueue<T> {
    private readonly heap: T[];
    private readonly comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.heap = [];
        this.comparator = comparator;
    }

    private getLeftChildIndex(parentIndex: number): number {
        return 2 * parentIndex + 1;
    }

    private getRightChildIndex(parentIndex: number): number {
        return 2 * parentIndex + 2;
    }

    private getParentIndex(childIndex: number): number {
        return Math.floor((childIndex - 1) / 2);
    }

    private swap(indexOne: number, indexTwo: number): void {
        const temp = this.heap[indexOne];
        this.heap[indexOne] = this.heap[indexTwo];
        this.heap[indexTwo] = temp;
    }

    private siftUp(): void {
        let currentIndex = this.heap.length - 1;

        while (currentIndex > 0 && this.comparator(this.heap[currentIndex], this.heap[this.getParentIndex(currentIndex)]) < 0) {
            const parentIndex = this.getParentIndex(currentIndex);
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
        }
    }

    private siftDown(): void {
        let currentIndex = 0;
        let leftChildIndex = this.getLeftChildIndex(currentIndex);
        let rightChildIndex = this.getRightChildIndex(currentIndex);

        while (leftChildIndex < this.heap.length) {
            let smallerChildIndex = leftChildIndex;
            if (rightChildIndex < this.heap.length && this.comparator(this.heap[rightChildIndex], this.heap[leftChildIndex]) < 0) {
                smallerChildIndex = rightChildIndex;
            }

            if (this.comparator(this.heap[currentIndex], this.heap[smallerChildIndex]) <= 0) {
                break;
            }

            this.swap(currentIndex, smallerChildIndex);
            currentIndex = smallerChildIndex;
            leftChildIndex = this.getLeftChildIndex(currentIndex);
            rightChildIndex = this.getRightChildIndex(currentIndex);
        }
    }

    public insert(value: T): void {
        this.heap.push(value);
        this.siftUp();
    }

    public remove(): T | null {
        if (this.heap.length === 0) {
            return null;
        }
        if (this.heap.length === 1) {
            return this.heap.pop() as T;
        }
        const min: T = this.heap[0];
        this.heap[0] = this.heap.pop() as T;
        this.siftDown();
        return min;
    }

    public peek(): T | null {
        if (this.heap.length === 0) {
            return null;
        }
        return this.heap[0];
    }

    public size(): number {
        return this.heap.length;
    }

    public isEmpty(): boolean {
        return this.size() === 0;
    }
}

export default PriorityQueue;