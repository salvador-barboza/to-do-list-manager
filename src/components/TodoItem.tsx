import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash, PencilSimple } from '@phosphor-icons/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Todo } from '@/lib/data';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo & { _id: string };
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo._id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(todo.text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="group flex items-center gap-3 p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow"
    >
      <Checkbox
        id={`todo-${todo._id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo._id)}
        className="flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-auto p-0 border-0 bg-transparent font-normal text-base focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <p
            className={cn(
              "text-base leading-relaxed cursor-pointer transition-all duration-200",
              todo.completed && "line-through text-muted-foreground opacity-70"
            )}
            onDoubleClick={handleEdit}
          >
            {todo.text}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <PencilSimple size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(todo._id)}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash size={14} />
        </Button>
      </div>
    </motion.div>
  );
}