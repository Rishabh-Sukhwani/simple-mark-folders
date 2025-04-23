
import { Sidebar } from "@/components/Sidebar";
import { NoteList } from "@/components/NoteList";
import { NoteEditor } from "@/components/NoteEditor";

const Index = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <NoteList />
      <NoteEditor />
    </div>
  );
};

export default Index;
