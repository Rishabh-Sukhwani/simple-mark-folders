
import { useState } from "react";
import { Folder, Tag, useNoteStore, TAG_COLORS } from "@/lib/store";
import { Plus, Folder as FolderIcon, Tag as TagIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("blue");

  const {
    folders,
    tags,
    activeFolderId,
    activeTagId,
    searchQuery,
    setActiveFolderId,
    setActiveTagId,
    createFolder,
    deleteFolder,
    createTag,
    deleteTag,
    setSearchQuery,
  } = useNoteStore();

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName("");
      setFolderDialogOpen(false);
    }
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTag(newTagName, newTagColor);
      setNewTagName("");
      setTagDialogOpen(false);
    }
  };

  return (
    <div className="h-full w-64 bg-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-note-purple">NoteMark</h1>
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Folders */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">FOLDERS</h2>
          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mt-2"
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleCreateFolder}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              isActive={folder.id === activeFolderId}
              onClick={() => setActiveFolderId(folder.id)}
              onDelete={() => deleteFolder(folder.id)}
            />
          ))}
          {folders.length === 0 && (
            <p className="text-xs text-muted-foreground py-1">No folders yet</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">TAGS</h2>
          <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="mt-2"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(TAG_COLORS).map(([colorName, _]) => (
                  <div
                    key={colorName}
                    className={cn(
                      "w-6 h-6 rounded-full cursor-pointer",
                      `bg-tag-${colorName}`,
                      newTagColor === colorName && "ring-2 ring-primary"
                    )}
                    onClick={() => setNewTagColor(colorName)}
                  />
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleCreateTag}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              isActive={tag.id === activeTagId}
              onClick={() => setActiveTagId(tag.id)}
              onDelete={() => deleteTag(tag.id)}
            />
          ))}
          {tags.length === 0 && (
            <p className="text-xs text-muted-foreground py-1">No tags yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface FolderItemProps {
  folder: Folder;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function FolderItem({ folder, isActive, onClick, onDelete }: FolderItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between px-2 py-1.5 rounded-md",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
      )}
    >
      <button
        className="flex items-center flex-1 text-sm"
        onClick={onClick}
      >
        <FolderIcon className="mr-2 h-4 w-4" />
        <span className="truncate">{folder.name}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface TagItemProps {
  tag: Tag;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function TagItem({ tag, isActive, onClick, onDelete }: TagItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-1 px-2 py-1 rounded-full text-xs",
        `bg-tag-${tag.color}`,
        isActive && "ring-2 ring-primary"
      )}
    >
      <button
        className="flex items-center"
        onClick={onClick}
      >
        <TagIcon className="mr-1 h-3 w-3" />
        <span>{tag.name}</span>
      </button>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 rounded-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
