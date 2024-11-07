import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Car {
  id: string;
  model: string;
  year: number;
  series: string;
  condition: string;
  rarity: string;
  price: number;
  acquisition_date: string;
  notes: string;
  photos: string[];
  tags: string[];
  groups: string[];
}

interface CollectionState {
  cars: Car[];
  loading: boolean;
  addCar: (car: Omit<Car, 'id'>) => Promise<void>;
  updateCar: (id: string, car: Partial<Car>) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  fetchCars: () => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  cars: [],
  loading: false,
  addCar: async (car) => {
    const { data, error } = await supabase
      .from('cars')
      .insert([car])
      .select();
    if (error) throw error;
    set((state) => ({ cars: [...state.cars, data[0]] }));
  },
  updateCar: async (id, car) => {
    const { data, error } = await supabase
      .from('cars')
      .update(car)
      .eq('id', id)
      .select();
    if (error) throw error;
    set((state) => ({
      cars: state.cars.map((c) => (c.id === id ? { ...c, ...data[0] } : c)),
    }));
  },
  deleteCar: async (id) => {
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({
      cars: state.cars.filter((c) => c.id !== id),
    }));
  },
  fetchCars: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('cars').select('*');
    if (error) throw error;
    set({ cars: data, loading: false });
  },
}));