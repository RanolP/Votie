import { deserializers, MapMapper, register, serializers } from './declarations'

export const registerType = register

export function serialize(value: any): any {
  if (value instanceof Object === false) {
    return value
  }
  for (const serializer of serializers) {
    if (serializer.check(value)) {
      return serializer.serialize(value)
    }
  }
  return { supported: false, toString: value.toString() }
}

export function deserialize(
  value: object | string | boolean | number | any[] | null | undefined
): any | null {
  if (value instanceof Object === false || value instanceof Array) {
    return value
  }
  for (const deserializer of deserializers) {
    const result = deserializer.deserialize(value as object)
    if (result) {
      return result
    }
  }
  return MapMapper.deserialize(value)
}
