import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define types
export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Folder = {
  id: string;
  name: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  folderId: string;
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
};

interface NoteState {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  activeNoteId: string | null;
  activeFolderId: string | null;
  activeTagId: string | null;
  searchQuery: string;

  // Note actions
  createNote: (folderId: string) => string;
  updateNote: (noteId: string, updates: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (noteId: string) => void;
  setActiveNoteId: (noteId: string | null) => void;

  // Folder actions
  createFolder: (name: string) => string;
  updateFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  setActiveFolderId: (folderId: string | null) => void;

  // Tag actions
  createTag: (name: string, color: string) => string;
  updateTag: (tagId: string, updates: Partial<Omit<Tag, 'id'>>) => void;
  deleteTag: (tagId: string) => void;
  setActiveTagId: (tagId: string | null) => void;

  // Other actions
  setSearchQuery: (query: string) => void;
  addTagToNote: (noteId: string, tagId: string) => void;
  removeTagFromNote: (noteId: string, tagId: string) => void;
  clearSearch: () => void;
  clearActiveSelections: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

// Available tag colors
export const TAG_COLORS = {
  blue: 'tag-blue',
  green: 'tag-green',
  yellow: 'tag-yellow',
  orange: 'tag-orange',
  pink: 'tag-pink',
  purple: 'tag-purple',
};

// Create store with persistence
export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      folders: [],
      tags: [],
      activeNoteId: null,
      activeFolderId: null,
      activeTagId: null,
      searchQuery: '',

      // Note actions
      createNote: (folderId) => {
        const newNote: Note = {
          id: generateId(),
          title: 'Untitled Note',
          content: '',
          folderId,
          tagIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          notes: [...state.notes, newNote],
          activeNoteId: newNote.id,
        }));

        return newNote.id;
      },

      updateNote: (noteId, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, ...updates, updatedAt: Date.now() }
              : note
          ),
        }));
      },

      deleteNote: (noteId) => {
        const { activeNoteId } = get();
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== noteId),
          activeNoteId: activeNoteId === noteId ? null : activeNoteId,
        }));
      },

      setActiveNoteId: (noteId) => {
        set({ activeNoteId: noteId });
      },

      // Folder actions
      createFolder: (name) => {
        const newFolder: Folder = {
          id: generateId(),
          name,
        };

        set((state) => ({
          folders: [...state.folders, newFolder],
          activeFolderId: newFolder.id,
        }));

        return newFolder.id;
      },

      updateFolder: (folderId, name) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === folderId ? { ...folder, name } : folder
          ),
        }));
      },

      deleteFolder: (folderId) => {
        const { activeFolderId } = get();
        
        // Delete all notes in this folder
        set((state) => ({
          notes: state.notes.filter((note) => note.folderId !== folderId),
          folders: state.folders.filter((folder) => folder.id !== folderId),
          activeFolderId: activeFolderId === folderId ? null : activeFolderId,
          activeNoteId: state.notes.find((note) => note.folderId === folderId && note.id === state.activeNoteId)
            ? null
            : state.activeNoteId,
        }));
      },

      setActiveFolderId: (folderId) => {
        set({
          activeFolderId: folderId,
          activeTagId: null, // Clear tag filter when selecting a folder
        });
      },

      // Tag actions
      createTag: (name, color) => {
        const newTag: Tag = {
          id: generateId(),
          name,
          color,
        };

        set((state) => ({
          tags: [...state.tags, newTag],
        }));

        return newTag.id;
      },

      updateTag: (tagId, updates) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === tagId ? { ...tag, ...updates } : tag
          ),
        }));
      },

      deleteTag: (tagId) => {
        const { activeTagId } = get();
        // Remove this tag from all notes
        set((state) => ({
          notes: state.notes.map((note) => ({
            ...note,
            tagIds: note.tagIds.filter((id) => id !== tagId),
          })),
          tags: state.tags.filter((tag) => tag.id !== tagId),
          activeTagId: activeTagId === tagId ? null : activeTagId,
        }));
      },

      setActiveTagId: (tagId) => {
        set({
          activeTagId: tagId,
          activeFolderId: null, // Clear folder filter when selecting a tag
        });
      },

      // Other actions
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      addTagToNote: (noteId, tagId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  tagIds: note.tagIds.includes(tagId)
                    ? note.tagIds
                    : [...note.tagIds, tagId],
                }
              : note
          ),
        }));
      },

      removeTagFromNote: (noteId, tagId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  tagIds: note.tagIds.filter((id) => id !== tagId),
                }
              : note
          ),
        }));
      },

      clearSearch: () => {
        set({ searchQuery: '' });
      },

      clearActiveSelections: () => {
        set({
          activeNoteId: null,
          activeFolderId: null,
          activeTagId: null,
          searchQuery: '',
        });
      },
    }),
    {
      name: 'notes-storage',
    }
  )
);
