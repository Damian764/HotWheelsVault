import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface GroupMember {
  user_id: string;
  access_level: 'viewer' | 'editor';
  joined_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  share_url?: string;
  created_at: string;
  owner_id: string;
  car_ids: string[];
  members: GroupMember[];
}

interface GroupState {
  groups: Group[];
  loading: boolean;
  error: string | null;
  createGroup: (data: Partial<Group>) => Promise<void>;
  updateGroup: (id: string, data: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  fetchGroups: () => Promise<void>;
  addCarToGroup: (groupId: string, carId: string) => Promise<void>;
  removeCarFromGroup: (groupId: string, carId: string) => Promise<void>;
  updateGroupVisibility: (groupId: string, isPublic: boolean) => Promise<void>;
  addGroupMember: (groupId: string, userId: string, accessLevel: 'viewer' | 'editor') => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  generateShareUrl: (groupId: string) => Promise<string>;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  createGroup: async (data) => {
    try {
      set({ loading: true, error: null });
      const { groups } = get();
      if (groups.length >= 20) {
        throw new Error('Maximum number of groups (20) reached');
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error('User not authenticated');

      const newGroup = {
        ...data,
        owner_id: userData.user.id,
        car_ids: [],
        members: [],
        created_at: new Date().toISOString(),
        is_public: false,
      };

      const { data: group, error } = await supabase
        .from('groups')
        .insert([newGroup])
        .select()
        .single();

      if (error) throw error;
      set({ groups: [...groups, group], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to create group', loading: false });
      throw error;
    }
  },

  updateGroup: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('groups')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === id ? { ...g, ...data } : g
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update group', loading: false });
      throw error;
    }
  },

  deleteGroup: async (id) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete group', loading: false });
      throw error;
    }
  },

  fetchGroups: async () => {
    try {
      set({ loading: true, error: null });

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .or(`owner_id.eq.${userData.user.id},is_public.eq.true`);

      if (error) throw error;

      const processedGroups = (data || []).map(group => ({
        ...group,
        car_ids: Array.isArray(group.car_ids) ? group.car_ids : [],
        members: Array.isArray(group.members) ? group.members : []
      }));

      set({ groups: processedGroups, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch groups', loading: false, groups: [] });
      throw error;
    }
  },

  addCarToGroup: async (groupId, carId) => {
    try {
      set({ loading: true, error: null });
      const group = get().groups.find((g) => g.id === groupId);
      if (!group) throw new Error('Group not found');

      const updatedCarIds = [...(group.car_ids || []), carId];
      await get().updateGroup(groupId, { car_ids: updatedCarIds });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add car to group', loading: false });
      throw error;
    }
  },

  removeCarFromGroup: async (groupId, carId) => {
    try {
      set({ loading: true, error: null });
      const group = get().groups.find((g) => g.id === groupId);
      if (!group) throw new Error('Group not found');

      const updatedCarIds = (group.car_ids || []).filter((id) => id !== carId);
      await get().updateGroup(groupId, { car_ids: updatedCarIds });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove car from group', loading: false });
      throw error;
    }
  },

  updateGroupVisibility: async (groupId, isPublic) => {
    try {
      set({ loading: true, error: null });
      await get().updateGroup(groupId, { is_public: isPublic });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update group visibility', loading: false });
      throw error;
    }
  },

  addGroupMember: async (groupId, userId, accessLevel) => {
    try {
      set({ loading: true, error: null });
      const group = get().groups.find((g) => g.id === groupId);
      if (!group) throw new Error('Group not found');

      const updatedMembers = [
        ...(group.members || []),
        {
          user_id: userId,
          access_level: accessLevel,
          joined_at: new Date().toISOString(),
        },
      ];

      await get().updateGroup(groupId, { members: updatedMembers });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add group member', loading: false });
      throw error;
    }
  },

  removeGroupMember: async (groupId, userId) => {
    try {
      set({ loading: true, error: null });
      const group = get().groups.find((g) => g.id === groupId);
      if (!group) throw new Error('Group not found');

      const updatedMembers = (group.members || []).filter(
        (member) => member.user_id !== userId
      );

      await get().updateGroup(groupId, { members: updatedMembers });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove group member', loading: false });
      throw error;
    }
  },

  generateShareUrl: async (groupId) => {
    try {
      set({ loading: true, error: null });
      
      // Get the current group
      const group = get().groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');

      // Generate a share URL using the current window location
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/shared/groups/${groupId}`;

      // Update the group with the new share URL
      await get().updateGroup(groupId, { share_url: shareUrl });
      
      set({ loading: false });
      return shareUrl;
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate share URL', loading: false });
      throw error;
    }
  },
}));