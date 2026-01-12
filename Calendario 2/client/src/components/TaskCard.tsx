import { Calendar, User, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string;
  platform: string;
  responsible: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'urgent';
  progress: number;
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'bg-slate-100 text-slate-700',
    icon: AlertCircle,
  },
  'in-progress': {
    label: 'Em Andamento',
    color: 'bg-blue-100 text-blue-700',
    icon: MessageSquare,
  },
  completed: {
    label: 'Concluído',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
  },
  urgent: {
    label: 'Urgente',
    color: 'bg-amber-100 text-amber-700',
    icon: AlertCircle,
  },
};

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  linkedin: 'bg-blue-50 text-blue-700 border-blue-200',
  tiktok: 'bg-black text-white border-black',
  facebook: 'bg-blue-50 text-blue-700 border-blue-200',
  twitter: 'bg-sky-50 text-sky-700 border-sky-200',
  email: 'bg-purple-50 text-purple-700 border-purple-200',
  website: 'bg-slate-50 text-slate-700 border-slate-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200',
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const statusInfo = statusConfig[task.status];
  const StatusIcon = statusInfo.icon;
  const platformColor = platformColors[task.platform.toLowerCase()] || platformColors.other;

  return (
    <div
      onClick={onClick}
      className="card-elevated cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg"
    >
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-heading mb-2 line-clamp-2">{task.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${platformColor}`}>
                {task.platform}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <p className="text-body mb-4 line-clamp-3 text-muted-foreground">{task.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-label text-muted-foreground">Progresso</span>
            <span className="text-label font-semibold text-foreground">{task.progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {getInitials(task.responsible)}
              </div>
              <span className="text-label text-muted-foreground">{task.responsible}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-label text-muted-foreground">{task.dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
