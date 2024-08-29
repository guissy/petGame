import create from "zustand";

interface PetState {
  hunger: number;
  feedPet: () => void;
}

export const usePetStore = create<PetState>((set) => ({
  hunger: 100,
  feedPet: () =>
    set((state) => ({
      hunger: Math.max(0, state.hunger - 10),
    })),
}));

