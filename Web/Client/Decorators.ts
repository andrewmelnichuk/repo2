function model(eventsChannel: string) {
  return (target: any) => {
    target["eventsChannel"] = eventsChannel;
    return target;
  }
}

function property (target: any, property: string) {
  var value = this[property];
  if (delete this[property]) {
    Object.defineProperty(target, property, {
      get: () => value,
      set: (newVal) => {
        if (value != newVal) {
          var oldVal = value;
          value = newVal;
          var channel = (<any>target).constructor["eventsChannel"];
          Client.Events.EventBus.Instance.fire(channel, "change", target, oldVal, newVal); 
        }
      },
      enumerable: true,
      configurable: true
    });
  }
}