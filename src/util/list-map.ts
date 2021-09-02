export interface ListMap<K, V> extends Iterable<[K, V]> {
  get isEmpty(): boolean;
  has(key: K): boolean;
  get(key: K): V | undefined;

  add(key: K, value: V): ListMap<K, V>;
  delete(key: K): ListMap<K, V>;
  set(key: K, value: V): void;

  filter(fn: (value: V, key: K) => boolean): ListMap<K, V>;
}

export namespace ListMap {
  export const empty = <K, V>(): ListMap<K, V> => new Nil();
  export const singleton = <K, V>(key: K, value: V): ListMap<K, V> =>
    new Cons(key, value, new Nil());

  class Nil<K, V> implements ListMap<K, V> {
    get isEmpty(): true {
      return true;
    }

    has(_key: K): false {
      return false;
    }

    get(_key: K): undefined {
      return undefined;
    }

    add(key: K, value: V): Cons<K, V> {
      return new Cons(key, value, this);
    }

    delete(_key: K): Nil<K, V> {
      return this;
    }

    set(_key: K, _value: V): void {
      return;
    }

    *[Symbol.iterator](): Iterator<[K, V]> {
      return;
    }

    filter(_fn: (value: V, key: K) => boolean): Nil<K, V> {
      return this;
    }
  }

  class Cons<K, V> implements ListMap<K, V> {
    constructor(public key: K, public value: V, public next: Nil<K, V> | Cons<K, V>) {}

    get isEmpty(): false {
      return false;
    }

    has(key: K): boolean {
      if (this.key === key) return true;
      return this.next.has(key);
    }

    get(key: K): V | undefined {
      if (this.key === key) return this.value;
      return this.next.get(key);
    }

    add(key: K, value: V): Cons<K, V> {
      return new Cons(key, value, this);
    }

    delete(key: K): Nil<K, V> | Cons<K, V> {
      if (this.key === key) return this.next;
      return new Cons(this.key, this.value, this.next.delete(key));
    }

    set(key: K, value: V): void {
      if (this.key === key) this.value = value;
      else this.next.set(key, value);
    }

    *[Symbol.iterator](): Iterator<[K, V]> {
      yield [this.key, this.value];
      yield* this.next;
    }

    filter(fn: (value: V, key: K) => boolean): Nil<K, V> | Cons<K, V> {
      if (fn(this.value, this.key)) return new Cons(this.key, this.value, this.next.filter(fn));
      else return this.next.filter(fn);
    }
  }
}
