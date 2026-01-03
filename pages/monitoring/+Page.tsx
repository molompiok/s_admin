import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/SublymusApi';
import { ServiceStatus, ServiceStat, HostStatus, HostStat } from '../../api/Interfaces';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Play, Square, RefreshCw, Cpu, HardDrive, Thermometer, Activity, Search, Server } from 'lucide-react';

export default function MonitoringPage() {
    const [services, setServices] = useState<ServiceStatus[]>([]);
    const [host, setHost] = useState<HostStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'app' | 'theme' | 'store'>('all');

    const fetchStats = async () => {
        try {
            const data = await api.monitoring.getStats();
            if (Array.isArray(data)) {
                setServices(data);
                setHost(null);
            } else {
                setServices(data.services);
                setHost(data.host);
            }
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Erreur lors de la récupération des statistiques.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 2*60*1000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id: string, type: string, action: string, replicas?: number) => {
        try {
            await api.monitoring.performAction({ id, type, action, replicas });
            fetchStats();
        } catch (err) {
            alert('Erreur lors de l\'exécution de l\'action.');
        }
    };

    const handleGroupAction = async (type: string, action: string) => {
        try {
            await api.monitoring.performGroupAction({ type, action });
            fetchStats();
        } catch (err) {
            alert('Erreur lors de l\'exécution de l\'action de groupe.');
        }
    };

    const filteredStats = useMemo(() => {
        return services.filter(s => {
            const matchesTab = activeTab === 'all' || s.type === activeTab;
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [services, activeTab, searchTerm]);

    if (loading && services.length === 0) return <div className="p-10 text-center text-gray-500">Chargement du monitoring...</div>;

    const apps = filteredStats.filter(s => s.type === 'app');
    const themes = filteredStats.filter(s => s.type === 'theme');
    const stores = filteredStats.filter(s => s.type === 'store');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Monitoring Système</h1>
                    <p className="text-gray-500 text-sm mt-1">Surveillance en temps réel de l'infrastructure</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleGroupAction('all', 'start')} 
                        className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm"
                    >
                        <Play size={16} className="mr-2" /> Tout Démarrer
                    </button>
                    <button 
                        onClick={() => handleGroupAction('all', 'stop')} 
                        className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                        <Square size={16} className="mr-2" /> Tout Arrêter
                    </button>
                </div>
            </div>

            {host && <HostWidget host={host} />}

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                    {[
                        { id: 'all', label: 'Tous', count: services.length },
                        { id: 'app', label: 'Apps', count: services.filter(s => s.type === 'app').length },
                        { id: 'theme', label: 'Thèmes', count: services.filter(s => s.type === 'theme').length },
                        { id: 'store', label: 'Boutiques', count: services.filter(s => s.type === 'store').length },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-emerald-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label} <span className="ml-1 opacity-60 text-xs">({tab.count})</span>
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un service..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">{error}</div>}

            {apps.length > 0 && <Section title="Applications Globales" services={apps} onAction={handleAction} />}
            {themes.length > 0 && <Section title="Thèmes" services={themes} onAction={handleAction} />}
            {stores.length > 0 && <Section title="APIs Boutiques" services={stores} onAction={handleAction} />}
            
            {filteredStats.length === 0 && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Server size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Aucun service trouvé pour votre recherche.</p>
                </div>
            )}
        </div>
    );
}

function HostWidget({ host }: { host: HostStatus }) {
    const formatData = (history: HostStat[]) => {
        return history.map(h => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            cpu: Math.round(h.cpu),
            memory: Math.round(h.memory),
            disk: Math.round(h.disk),
            temp: Math.round(h.temp)
        }));
    };

    const data = formatData(host.history);
    const current = host.current;

    // Helper to format uptime
    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}j ${hours}h ${minutes}m`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="CPU Load" 
                    value={`${Math.round(current.cpu)}%`} 
                    icon={<Cpu size={20} />}
                    trend={{ value: Math.abs(Math.round(current.cpu - (host.history[host.history.length - 2]?.cpu || 0))), label: 'vs last check', positive: current.cpu < (host.history[host.history.length - 2]?.cpu || 0) }}
                />
                <StatCard 
                    title="Memory Usage" 
                    value={`${Math.round(current.memory)}%`} 
                    icon={<Activity size={20} />}
                    trend={{ value: Math.abs(Math.round(current.memory - (host.history[host.history.length - 2]?.memory || 0))), label: 'vs last check', positive: current.memory < (host.history[host.history.length - 2]?.memory || 0) }}
                />
                <StatCard 
                    title="Disk Usage" 
                    value={`${Math.round(current.disk)}%`} 
                    icon={<HardDrive size={20} />}
                />
                <StatCard 
                    title="Temperature" 
                    value={`${Math.round(current.temp)}°C`} 
                    icon={<Thermometer size={20} />}
                />
            </div>

            <Card className="lg:col-span-3" title="System Load History">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="cpu" stroke="#10b981" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" strokeWidth={2} />
                            <Area type="monotone" dataKey="memory" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMem)" name="Memory %" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="lg:col-span-1" title="Host Info">
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">OS</span>
                        <span className="font-medium text-sm text-right">{host.os.distro} <br/><span className="text-xs text-gray-400">{host.os.release}</span></span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">Uptime</span>
                        <span className="font-medium text-sm">{formatUptime(host.uptime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500 text-sm">CPU</span>
                        <span className="font-medium text-sm text-right">{host.cpu.cores} vCores</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 text-sm">Model</span>
                        <span className="font-medium text-xs text-right max-w-[150px] truncate" title={host.cpu.brand}>{host.cpu.brand}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function Section({ title, services, onAction }: { title: string, services: ServiceStatus[], onAction: any }) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-l-4 border-emerald-500 pl-3">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map(service => (
                    <ServiceCard key={service.id} service={service} onAction={onAction} />
                ))}
            </div>
        </div>
    );
}

function ServiceCard({ service, onAction }: { service: ServiceStatus, onAction: any }) {
    const [replicas, setReplicas] = useState(service.current.replicas);

    const formatData = (history: ServiceStat[]) => {
        return history.map(h => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            cpu: Math.round(h.cpu * 10) / 10,
            memory: Math.round(h.memory / 1024 / 1024 * 10) / 10, // MB
            replicas: h.replicas
        }));
    };

    const data = formatData(service.history);

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{service.name}</h3>
                    <Badge variant={service.status === 'running' ? 'success' : 'danger'}>
                        {service.status === 'running' ? 'En cours' : 'Arrêté'}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onAction(service.id, service.type, 'restart')} 
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                        title="Redémarrer"
                    >
                        <RefreshCw size={16} />
                    </button>
                    {service.status === 'running' ? (
                        <button 
                            onClick={() => onAction(service.id, service.type, 'stop')} 
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Arrêter"
                        >
                            <Square size={16} />
                        </button>
                    ) : (
                        <button 
                            onClick={() => onAction(service.id, service.type, 'scale', 1)} 
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Démarrer"
                        >
                            <Play size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">CPU</div>
                    <div className="font-semibold text-sm">{Math.round(service.current.cpu * 10) / 10}%</div>
                </div>
                <div className="text-center border-l border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">RAM</div>
                    <div className="font-semibold text-sm">{Math.round(service.current.memory / 1024 / 1024)} MB</div>
                </div>
                <div className="text-center border-l border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Répliques</div>
                    <div className="flex items-center justify-center gap-1">
                        <input
                            type="number"
                            value={replicas}
                            onChange={(e) => setReplicas(parseInt(e.target.value))}
                            className="w-8 text-center bg-white border border-gray-200 rounded text-xs py-0.5"
                        />
                        <button 
                            onClick={() => onAction(service.id, service.type, 'scale', replicas)}
                            className="text-emerald-600 hover:text-emerald-700"
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                        />
                        <Line type="monotone" dataKey="cpu" stroke="#10b981" dot={false} strokeWidth={2} />
                        <Line type="monotone" dataKey="memory" stroke="#3b82f6" dot={false} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
