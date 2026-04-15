import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { mockTasks } from '@/data/mockData'
import { MoreVertical } from 'lucide-react'

const Tasks = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage your daily action items.</p>
        </div>
        <div className="flex gap-3">
          <Button className="font-heading font-bold tracking-tight">New Task</Button>
        </div>
      </header>

      <section className="space-y-4">
        {mockTasks.map((task, i) => (
          <Card key={i} className={`bg-card rounded-xl border-none p-4 flex items-center justify-between group transition-all duration-300 hover:bg-muted/40 ${task.status === 'Done' ? 'opacity-60' : 'editorial-shadow'}`}>
            <div className="flex items-center gap-4">
              <Checkbox id={`task-${task.id}`} checked={task.status === 'Done'} className={task.status === 'Done' ? 'data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white border-emerald-500' : ''} />
              <div>
                <p className={`font-semibold text-[15px] text-foreground ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground font-medium">{task.project}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <Badge variant="outline" className={`border-none rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold gap-1 
                ${task.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                  task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                  'bg-primary/10 text-primary'}`}>
                {task.priority} Priority
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default Tasks
