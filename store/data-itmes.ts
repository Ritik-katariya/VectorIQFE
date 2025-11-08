import { create } from "zustand";

export type SelectedItem = { id: string; name: string; ChunksIds: string[] };

interface DataItemStore {
  dataItems: SelectedItem[];
  setDataItems: (dataItems: SelectedItem[]) => void;
}

const useDataItemStore = create<DataItemStore>()((set) => ({
  dataItems: [],
  setDataItems: (dataItems: SelectedItem[]) => set({ dataItems }),
}));

export default useDataItemStore;
