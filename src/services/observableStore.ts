export class Store<S> {
  state: S;
  subscribers: Set<(state: S) => void>;

  constructor(initalState: S) {
    this.state = initalState;
    this.subscribers = new Set();
  }

  get() {
    return this.state;
  }

  subscribe(callback: (state: S) => void) {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  set(value: Partial<S>) {
    this.state = { ...this.state, ...value };
    this.subscribers.forEach((callBack) => callBack(this.state));
  }
}
