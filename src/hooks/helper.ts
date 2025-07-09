import { type Ref } from 'vue';

export function isRefDefined<T>(r: Ref<T | undefined> | undefined): r is Ref<T> {
  return r !== undefined && r.value !== undefined;
}