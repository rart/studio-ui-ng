export class PublishingChannel {

  name: string;
  order: number;
  publish: boolean;
  updateStatus: true;

  static deserialize(json: Object): PublishingChannel {
    let model = new PublishingChannel();
    ['name', 'order', 'publish', 'updateStatus'].forEach(prop => {
      model[prop] = json[prop];
    });
    return model;
  }

  serialize(): Object {
    return undefined;
  }

}
