import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Filter, Calendar, Users, CheckCircle2, AlertCircle, Clock, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { ref, onValue, push, set, update } from 'firebase/database';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  platform: string;
  responsible: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  progress: number;
  objective?: string;
}

const TEAM_MEMBERS = [
  { name: 'Rogeria', initials: 'Ro', color: '#003366' },
  { name: 'Tiago', initials: 'Ti', color: '#4682B4' },
  { name: 'Wallace', initials: 'Wa', color: '#006400' },
  { name: 'Novo Colab', initials: 'NC', color: '#DAA520' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pendente', icon: Clock, color: '#4B4B4B', bgColor: '#F5F5F5' },
  'in-progress': { label: 'Em Progresso', icon: AlertCircle, color: '#DAA520', bgColor: '#FEF3C7' },
  completed: { label: 'Concluído', icon: CheckCircle2, color: '#006400', bgColor: '#ECFDF5' },
};

const mapFirebaseStatus = (status: string): 'pending' | 'in-progress' | 'completed' => {
  const s = status?.toLowerCase() || '';
  if (s.includes('progresso')) return 'in-progress';
  if (s.includes('concluído') || s.includes('concluido')) return 'completed';
  return 'pending';
};

const reverseMapStatus = (status: string): string => {
  if (status === 'in-progress') return 'Em Progresso';
  if (status === 'completed') return 'Concluído';
  return 'Pendente';
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    responsible: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    dueDate: '',
    progress: 0,
    objective: ''
  });

  useEffect(() => {
    const agendaRef = ref(db, 'agenda');
    const unsubscribe = onValue(agendaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksList: Task[] = Object.entries(data)
          .filter(([_, value]: [string, any]) => value && value.Título)
          .map(([key, value]: [string, any]) => ({
            id: key,
            title: value.Título || 'Sem Título',
            description: value.Descrição || '',
            platform: value.Plataforma || 'N/A',
            responsible: value.Responsável || 'Não Atribuído',
            status: mapFirebaseStatus(value.Status),
            dueDate: value['Data de Entrega'] || '',
            progress: typeof value['Progresso (%)'] === 'number' ? value['Progresso (%)'] : parseInt(value['Progresso (%)']) || 0,
            objective: value.objetivo || '',
          }));
        setTasks(tasksList);
      } else {
        setTasks([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar dados do Firebase:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      platform: '',
      responsible: '',
      status: 'pending',
      dueDate: '',
      progress: 0,
      objective: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      platform: task.platform,
      responsible: task.responsible,
      status: task.status,
      dueDate: task.dueDate.split('T')[0], // Format for date input
      progress: task.progress,
      objective: task.objective || ''
    });
    setSelectedTask(task);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      "Título": formData.title,
      "Descrição": formData.description,
      "Plataforma": formData.platform,
      "Responsável": formData.responsible,
      "Status": reverseMapStatus(formData.status),
      "Data de Entrega": formData.dueDate ? `${formData.dueDate}T03:00:00.000Z` : "",
      "Progresso (%)": formData.progress,
      "objetivo": formData.objective,
      "Data de Criação": isEditing ? selectedTask?.id : new Date().toISOString()
    };

    try {
      if (isEditing && selectedTask) {
        await update(ref(db, `agenda/${selectedTask.id}`), taskData);
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        const newRef = push(ref(db, 'agenda'));
        await set(newRef, taskData);
        toast.success('Tarefa criada com sucesso!');
      }
      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
      toast.error('Erro ao salvar tarefa.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const responsibleMatch = filterResponsible === 'all' || task.responsible === filterResponsible;
    return statusMatch && responsibleMatch;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const getMemberColor = (name: string) => {
    return TEAM_MEMBERS.find(m => m.name === name)?.color || '#64748b';
  };

  const getMemberInitials = (name: string) => {
    const member = TEAM_MEMBERS.find(m => m.name === name);
    if (member) return member.initials;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Sem data';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Carregando dados do Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display text-4xl font-bold text-foreground">Painel de Marketing</h1>
              <p className="mt-2 text-muted-foreground">Acompanhamento de tarefas e entregas da equipe PSR</p>
            </div>
            <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus size={18} />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </header>

      {/* KPI Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-elevated p-6">
              <div className="text-label text-muted-foreground">Total de Tarefas</div>
              <div className="mt-3 text-3xl font-bold text-foreground">{stats.total}</div>
            </div>
            <div className="card-elevated p-6">
              <div className="text-label text-muted-foreground">Pendentes</div>
              <div className="mt-3 text-3xl font-bold" style={{ color: '#4B4B4B' }}>{stats.pending}</div>
            </div>
            <div className="card-elevated p-6">
              <div className="text-label text-muted-foreground">Em Progresso</div>
              <div className="mt-3 text-3xl font-bold" style={{ color: '#DAA520' }}>{stats.inProgress}</div>
            </div>
            <div className="card-elevated p-6">
              <div className="text-label text-muted-foreground">Concluídas</div>
              <div className="mt-3 text-3xl font-bold" style={{ color: '#006400' }}>{stats.completed}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <span className="text-label text-muted-foreground">Filtrar por:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'in-progress', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground hover:bg-border'
                  }`}
                >
                  {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'in-progress' ? 'Em Progresso' : 'Concluídas'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 md:ml-auto">
              {['all', ...TEAM_MEMBERS.map(m => m.name), 'Não Atribuído'].map(member => (
                <button
                  key={member}
                  onClick={() => setFilterResponsible(member)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filterResponsible === member
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground hover:bg-border'
                  }`}
                >
                  {member === 'all' ? 'Todos' : member}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tasks Grid */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, index) => {
              const statusConfig = STATUS_CONFIG[task.status];
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={task.id}
                  onClick={() => handleOpenEditModal(task)}
                  className="card-elevated p-6 cursor-pointer group overflow-hidden"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards`,
                    opacity: 0,
                  }}
                >
                  <style>{`
                    @keyframes fadeInUp {
                      from {
                        opacity: 0;
                        transform: translateY(20px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-heading text-foreground line-clamp-2">{task.title}</h3>
                      <p className="text-label text-muted-foreground mt-1">{task.platform}</p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2"
                      style={{ backgroundColor: getMemberColor(task.responsible) }}
                    >
                      {getMemberInitials(task.responsible)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4 p-2 rounded-md" style={{ backgroundColor: statusConfig.bgColor }}>
                    <StatusIcon size={16} style={{ color: statusConfig.color }} />
                    <span className="text-xs font-medium" style={{ color: statusConfig.color }}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Progresso</span>
                      <span className="text-xs font-bold text-foreground">{task.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor: task.progress === 100 ? '#006400' : '#DAA520',
                        }}
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={14} />
                    <span>Entrega: {formatDate(task.dueDate)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border my-4" />

                  {/* Description Preview */}
                  <p className="text-body text-muted-foreground line-clamp-2">{task.description || 'Sem descrição.'}</p>

                  {/* Hover Indicator */}
                  <div className="mt-4 text-xs text-primary font-medium group-hover:underline">
                    Clique para editar →
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg">Nenhuma tarefa encontrada com os filtros selecionados.</div>
            </div>
          )}
        </div>
      </section>

      {/* Task Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Ex: Campanha Instagram"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plataforma</label>
                <Input 
                  required 
                  value={formData.platform} 
                  onChange={e => setFormData({...formData, platform: e.target.value})} 
                  placeholder="Ex: Instagram, LinkedIn"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Responsável</label>
                <Select value={formData.responsible} onValueChange={v => setFormData({...formData, responsible: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map(m => (
                      <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                    ))}
                    <SelectItem value="Não Atribuído">Não Atribuído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Entrega</label>
                <Input 
                  type="date" 
                  value={formData.dueDate} 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in-progress">Em Progresso</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Progresso ({formData.progress}%)</label>
                <Input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={formData.progress} 
                  onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Objetivo</label>
              <Input 
                value={formData.objective} 
                onChange={e => setFormData({...formData, objective: e.target.value})} 
                placeholder="Ex: Engajamento, Vendas"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Detalhes da tarefa..."
                rows={4}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary text-white">
                {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
