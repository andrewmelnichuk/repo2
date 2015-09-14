module Client.Common {
  
  export interface IDictionary<TValue> {
    [key: string]: TValue;
  }
  
  export interface IDictionary2<TKey, TValue> {
    add(key: TKey, value: TValue): void;
    remove(key: TKey): void;
    containsKey(key: TKey): boolean;
    keys(): TKey[];
    values(): TValue[];
  }

  export class Dictionary<TKey, TValue> implements IDictionary2<TKey, TValue> {

    private _keys: TKey[] = [];
    private _values: TValue[] = [];

    constructor(init?: Object) {
      if (!init) return;
      for (var key in init) {
        if (init.hasOwnProperty(key))
          this.add(key, init[key]);
      }
    }

    public get(key: TKey): TValue {
      return this[key.toString()];
    }

    public add(key: TKey, value: TValue) {
      this[key.toString()] = value;
      this._keys.push(key);
      this._values.push(value);
    }
  
    public remove(key: TKey) {
      var index = this._keys.indexOf(key, 0);
      this._keys.splice(index, 1);
      this._values.splice(index, 1);
      delete this[key.toString()];
    }

    public keys(): TKey[] {
      return this._keys;
    }
  
    public values(): TValue[] {
      return this._values;
    }
  
    public containsKey(key: TKey): boolean {
      return this[key.toString()];
    }
  }
}