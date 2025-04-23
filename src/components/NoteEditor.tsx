
import { useEffect, useState } from "react";
import { Note, Tag, useNoteStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagBadge } from "@/components/TagBadge";
import { Check, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function NoteEditor() {
  const {
    notes,
    tags,
    activeNoteId,
    updateNote,
    deleteNote,
    addTagToNote,
    removeTagFromNote,
  } = useNoteStore();

  const [selectedTab, setSelectedTab] = useState<"edit" | "preview">("edit");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [showTagMenu, setShowTagMenu] = useState(false);

  // Get the current active note
  const activeNote = notes.find((note) => note.id === activeNoteId);
  
  // Get tags for the active note
  const noteTags = activeNote
    ? tags.filter((tag) => activeNote.tagIds.includes(tag.id))
    : [];

  // Filter available tags based on search query
  const availableTags = tags.filter((tag) => 
    !activeNote?.tagIds.includes(tag.id) && 
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // Update local state when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [activeNote]);

  // Update note in store when title or content changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (activeNoteId) {
      updateNote(activeNoteId, { title: newTitle });
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (activeNoteId) {
      updateNote(activeNoteId, { content: newContent });
    }
  };

  // Handle tag related actions
  const handleAddTag = (tagId: string) => {
    if (activeNoteId) {
      addTagToNote(activeNoteId, tagId);
      setShowTagMenu(false);
      setTagSearchQuery("");
    }
  };

  const handleRemoveTag = (tagId: string) => {
    if (activeNoteId) {
      removeTagFromNote(activeNoteId, tagId);
    }
  };

  const handleDeleteNote = () => {
    if (activeNoteId) {
      deleteNote(activeNoteId);
    }
  };

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-medium text-note-purple mb-2">No note selected</h2>
          <p className="text-muted-foreground">
            Select a note from the list or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Note header */}
      <div className="p-4 border-b border-border flex flex-col gap-2">
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title"
          className="text-lg font-medium border-none shadow-none focus:ring-0"
        />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {noteTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => handleRemoveTag(tag.id)}
            />
          ))}
          
          {/* Add tag button and popup */}
          <div className="relative">
            <button
              onClick={() => setShowTagMenu(!showTagMenu)}
              className="flex items-center text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add tag
            </button>
            
            {showTagMenu && (
              <div className="absolute z-10 mt-1 w-48 rounded-md bg-popover shadow-lg py-1">
                <Input
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  placeholder="Search tags..."
                  className="mx-1 mb-1"
                />
                <div className="max-h-32 overflow-auto">
                  {availableTags.length > 0 ? (
                    availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        className={cn(
                          "w-full text-left px-3 py-1 text-sm flex items-center hover:bg-accent"
                        )}
                        onClick={() => handleAddTag(tag.id)}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            `bg-tag-${tag.color}`
                          )}
                        />
                        {tag.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-3 py-1">
                      {tagSearchQuery ? "No matching tags" : "No more tags available"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor/Preview tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value as "edit" | "preview")}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 border-b border-border">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent
          value="edit"
          className="flex-1 p-0 data-[state=active]:flex flex-col"
        >
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write your markdown note here..."
            className="flex-1 resize-none border-none rounded-none shadow-none p-4 focus-visible:ring-0"
          />
        </TabsContent>
        
        <TabsContent
          value="preview"
          className="flex-1 p-0 data-[state=active]:flex flex-col overflow-auto"
        >
          {content ? (
            <div className="prose prose-sm max-w-none p-4">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>No content to preview</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="p-2 border-t border-border flex justify-end">
        <button
          onClick={handleDeleteNote}
          className="text-xs text-destructive hover:underline"
        >
          Delete note
        </button>
      </div>
    </div>
  );
}
