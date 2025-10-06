import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TodoItem } from '@/components/TodoItem';
import { todoCollection } from '@/lib/data';
import { toast } from 'sonner';

type FilterType = 'all' | 'active' | 'completed';

function App() {
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => todoCollection.getAll(),
  });

  const addTodo = useMutation({
    mutationFn: (text: string) => todoCollection.insert({
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodo('');
      toast.success('Task added successfully!');
    },
  });

  const toggleTodo = useMutation({
    mutationFn: (id: string) => {
      const todo = todos.find(t => t._id === id);
      if (!todo) throw new Error('Todo not found');
      return todoCollection.update(id, { 
        completed: !todo.completed,
        updatedAt: Date.now(),
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      const todo = todos.find(t => t._id === id);
      if (todo && !todo.completed) {
        toast.success('Task completed! 🎉');
      }
    },
  });

  const updateTodo = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => 
      todoCollection.update(id, { 
        text: text.trim(),
        updatedAt: Date.now(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Task updated!');
    },
  });

  const deleteTodo = useMutation({
    mutationFn: (id: string) => todoCollection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Task deleted');
    },
  });

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo.mutate(newTodo);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="min-h-screen bg-background font-['Inter'] p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
            Todo List
          </h1>
          <p className="text-muted-foreground">
            Stay organized and get things done
          </p>
        </motion.div>

        <Card className="p-6 mb-6">
          <div className="flex gap-3 mb-6">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              className="flex-1"
              disabled={addTodo.isPending}
            />
            <Button 
              onClick={handleAddTodo}
              disabled={!newTodo.trim() || addTodo.isPending}
              className="px-4"
            >
              <Plus className="mr-2" size={16} />
              Add
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="relative"
              >
                All
                <Badge variant="secondary" className="ml-2">
                  {todos.length}
                </Badge>
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active
                <Badge variant="secondary" className="ml-2">
                  {activeTodosCount}
                </Badge>
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
                <Badge variant="secondary" className="ml-2">
                  {completedTodosCount}
                </Badge>
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {filter === 'all' ? 'No tasks yet. Add one above!' : 
                 filter === 'active' ? 'No active tasks' : 
                 'No completed tasks'}
              </div>
            ) : (
              <AnimatePresence>
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onToggle={(id) => toggleTodo.mutate(id)}
                    onUpdate={(id, text) => updateTodo.mutate({ id, text })}
                    onDelete={(id) => deleteTodo.mutate(id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </Card>

        {todos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            {activeTodosCount === 0 && completedTodosCount > 0 ? 
              '🎉 All tasks completed! Great job!' : 
              `${activeTodosCount} task${activeTodosCount !== 1 ? 's' : ''} remaining`
            }
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;