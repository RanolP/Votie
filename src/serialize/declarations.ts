import { deserialize, serialize } from '.'
import {
  IDeserializer,
  isDeserializer,
  ISerializer,
  isSerializer
} from './serializable'

export const MapMapper = {
  check: o => o instanceof Map,
  deserialize: value => {
    const result = new Map()
    for (const key of Object.keys(value)) {
      result.set(key, deserialize(value[key]))
    }
    return result
  },
  serialize: value => {
    const result = {}
    for (const key of value.keys()) {
      result[key] = serialize(value.get(key))
    }
    return result
  },
  toString: () => 'Mapper(Map)'
}

export const SetMapper = {
  check: o => o instanceof Set,
  deserialize: value => {
    if (value.type !== 'set') {
      return null
    }
    const result = new Set()
    for (const element of value.values) {
      result.add(deserialize(element))
    }
    return result
  },
  serialize: value => {
    const result = []
    for (const v of value.values()) {
      result.push(serialize(v))
    }
    return {
      type: 'set',
      values: result
    }
  },
  toString: () => 'Mapper(Set)'
}

export const serializers: Array<ISerializer<any>> = [MapMapper, SetMapper]
export const deserializers: Array<IDeserializer<any>> = [SetMapper]

export function register(serializer: ISerializer<any> | IDeserializer<any>) {
  if (isSerializer(serializer)) {
    serializers.push(serializer)
  }
  if (isDeserializer(serializer)) {
    deserializers.push(serializer)
  }
}
