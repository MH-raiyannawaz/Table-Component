export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;
export type Data = Record<string, unknown>;

export type TableProp = {
  url: string,
  setUrl: StateSetter<string>
}