export interface ISerializer<T> {
  check(o: any): boolean
  serialize(value: T): object
}
export interface IDeserializer<T> {
  deserialize(o: any): T | null
}

export interface IDataMapper<T> extends ISerializer<T>, IDeserializer<T> {}

export function isSerializer(object: any): object is ISerializer<any> {
  return (
    typeof object.check === 'function' && typeof object.serialize === 'function'
  )
}
export function isDeserializer(object: any): object is IDeserializer<any> {
  return typeof object.deserialize === 'function'
}
