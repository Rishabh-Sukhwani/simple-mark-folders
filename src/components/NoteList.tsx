
import { useState, useMemo } from "react";
import { Folder, Note, Tag, useNoteStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function NoteList() {
  const {
    notes,
    folders,
    tags,
    activeNoteId,
    activeFolderId,
    activeTagId,
    searchQuery,
    setActiveNoteId,
    createNote,
  } = useNoteStore();

  // Filter notes based on active folder, tag, and search query
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Filter by folder if one is selected
        if (activeFolderId && note.folderId !== activeFolderId) {
          return false;
        }

        // Filter by tag if one is selected
        if (activeTagId && !note.tagIds.includes(activeTagId)) {
          return false;
        }

        // Filter by search query if present
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt); // Sort by most recently updated
  }, [notes, activeFolderId, activeTagId, searchQuery]);

  // Get folder and tag maps for easy lookup
  const folderMap = useMemo(
    () => Object.fromEntries(folders.map((folder) => [folder.id, folder])),
    [folders]
  );

  const tagMap = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag.id, tag])),
    [tags]
  );

  const handleCreateNote = () => {
    if (!activeFolderId && folders.length > 0) {
      // If no folder is selected, create note in the first folder
      createNote(folders[0].id);
    } else if (activeFolderId) {
      // Create note in the active folder
      createNote(activeFolderId);
    } else {
      // No folders exist yet
      const newFolderId = useNoteStore.getState().createFolder("My Notes");
      createNote(newFolderId);
    }
  };

  return (
    <div className="w-72 border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="font-medium">Notes</h2>
        <Button variant="ghost" size="sm" onClick={handleCreateNote}>
          <PlusCircle className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              folder={folderMap[note.folderId]}
              tags={note.tagIds.map((id) => tagMap[id]).filter(Boolean)}
              onClick={() => setActiveNoteId(note.id)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No notes found</p>
            {!activeFolderId && !activeTagId && (
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={handleCreateNote}
              >
                Create your first note
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  folder: Folder | undefined;
  tags: Tag[];
  onClick: () => void;
}

function NoteItem({ note, isActive, folder, tags, onClick }: NoteItemProps) {
  // Extract preview text from note content
  const preview = note.content
    ? note.content.substring(0, 60) + (note.content.length > 60 ? "..." : "")
    : "No content";

  // Format the date
  const formattedDate = format(new Date(note.updatedAt), "MMM d, yyyy");

  return (
    <div
      className={cn(
        "p-3 border-b border-border cursor-pointer",
        isActive ? "bg-accent" : "hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium truncate">{note.title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {preview}
      </p>
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <div
              key={tag.id}
              className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                `bg-tag-${tag.color}`
              )}
            >
              {tag.name}
            </div>
          ))}
          {tags.length > 2 && (
            <div className="px-1.5 py-0.5 rounded-full text-xs bg-muted">
              +{tags.length - 2}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
    </div>
  );
}
