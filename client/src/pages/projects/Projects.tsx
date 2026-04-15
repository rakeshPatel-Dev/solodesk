import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockProjects } from '@/data/mockData'
import { Calendar, MoreVertical } from 'lucide-react'

const Projects = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-2">Active engagements and milestone tracking.</p>
        </div>
        <div className="flex gap-3">
          <Button className="font-heading font-bold tracking-tight">New Project</Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockProjects.map((project, i) => (
          <Card key={i} className="bg-card rounded-xl border-none editorial-shadow p-6 flex flex-col justify-between group transition-all hover:shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className={`border-none rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold gap-1 
                  ${project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                    project.status === 'Review' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                    'bg-primary/10 text-primary'}`}>
                  {project.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} />
                </Button>
              </div>
              
              <h3 className="font-heading text-xl font-bold text-foreground line-clamp-1">{project.name}</h3>
              <p className="text-sm font-medium mt-1 mb-6 text-muted-foreground">{project.client}</p>
            </div>
            
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2 bg-muted mb-4" />
              
              <div className="flex items-center text-xs text-muted-foreground font-medium gap-1.5 pt-4 border-t border-border/40">
                <Calendar size={14} />
                <span>Due {project.dueDate}</span>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default Projects
