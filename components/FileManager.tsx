
import React, { useState, useEffect } from 'react';
import { DriveFile, Folder } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { Language, t } from '../services/i18n';
import { 
    HardDrive, Upload, File, Image as ImageIcon, Music, Film, FileText, 
    Trash2, Search, Lock, Grid, List as ListIcon, 
    Download, Eye, FileSearch, X, ShieldCheck, PieChart, Info,
    Folder as FolderIcon, FolderOpen, FolderPlus, ChevronRight, ChevronDown, Move, CheckCircle,
    MoreVertical, Edit2, ArrowUpDown
} from 'lucide-react';
import { Button } from './Button';
import { ToolHeader } from './ToolParts';

interface FileManagerProps { lang: Language; }

export const FileManager: React.FC<FileManagerProps> = ({ lang }) => {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string>('root');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
    
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
    const [processingIds, setProcessingIds] = useState<string[]>([]);
    
    // New Folder UI
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Renaming UI
    const [renamingItem, setRenamingItem] = useState<{id: string, type: 'file' | 'folder'} | null>(null);
    const [renameText, setRenameText] = useState('');

    useEffect(() => { refreshData(); }, []);

    // Ensure we don't get stuck in a deleted folder
    useEffect(() => {
        if (currentFolderId !== 'root' && folders.length > 0) {
            const exists = folders.find(f => f.id === currentFolderId);
            if (!exists) setCurrentFolderId('root');
        }
    }, [folders, currentFolderId]);

    const refreshData = () => {
        setFiles(StorageService.getDriveFiles());
        setFolders(StorageService.getDriveFolders());
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;
        const file = fileList[0];
        setUploadProgress(0);
        try {
            const uploadedFile = await StorageService.uploadFile(file, currentFolderId, (p) => setUploadProgress(p));
            setUploadProgress(null);
            refreshData();
            
            // Auto-classify
            setProcessingIds(prev => [...prev, uploadedFile.id]);
            const classification = await GeminiService.classifyFile(uploadedFile.name, uploadedFile.type);
            const updated = { ...uploadedFile, tags: classification.tags, category: classification.category as any };
            StorageService.saveDriveFile(updated);
            setProcessingIds(prev => prev.filter(id => id !== uploadedFile.id));
            refreshData();
        } catch (err) { alert("Upload failed."); setUploadProgress(null); }
    };

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newFolderName.trim()) return;
        StorageService.createFolder(newFolderName, 'drive', currentFolderId);
        setNewFolderName('');
        setIsCreatingFolder(false);
        refreshData();
        setExpandedFolders(prev => new Set(prev).add(currentFolderId));
    };

    const handleDeleteFolder = (id: string) => {
        if(confirm("Are you sure? This will delete the folder and ALL contents recursively.")) {
            StorageService.deleteFolder(id);
            refreshData();
        }
    };

    const startRenaming = (id: string, type: 'file' | 'folder', currentName: string) => {
        setRenamingItem({ id, type });
        setRenameText(currentName);
    };

    const finishRenaming = () => {
        if (!renamingItem || !renameText.trim()) {
            setRenamingItem(null);
            return;
        }
        if (renamingItem.type === 'file') {
            StorageService.saveDriveFile({ ...files.find(f => f.id === renamingItem.id)!, name: renameText });
        } else {
            StorageService.updateFolder(renamingItem.id, { name: renameText });
        }
        refreshData();
        setRenamingItem(null);
    };

    // --- Drag and Drop Logic ---
    const onDragStart = (e: React.DragEvent, type: 'file' | 'folder', id: string) => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('id', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDrop = (e: React.DragEvent, targetFolderId: string) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const id = e.dataTransfer.getData('id');
        
        if (targetFolderId === id) return; 

        if (type === 'file') {
            const file = files.find(f => f.id === id);
            if (file && file.folderId !== targetFolderId) {
                StorageService.saveDriveFile({ ...file, folderId: targetFolderId });
                refreshData();
            }
        } else if (type === 'folder') {
            // Check for circular dependency before moving
            let parent = folders.find(f => f.id === targetFolderId);
            let isCycle = false;
            while(parent) {
                if(parent.id === id) isCycle = true;
                parent = folders.find(f => f.id === parent?.parentId);
            }
            if(!isCycle) {
                StorageService.updateFolder(id, { parentId: targetFolderId });
                refreshData();
            } else {
                alert("Cannot move a folder into its own subfolder.");
            }
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // --- Helpers ---
    const getFileIcon = (mime: string) => {
        if (mime.startsWith('image/')) return <ImageIcon size={28} strokeWidth={1.5} className="text-blue-400" />;
        if (mime.startsWith('video/')) return <Film size={28} strokeWidth={1.5} className="text-red-400" />;
        if (mime.startsWith('audio/')) return <Music size={28} strokeWidth={1.5} className="text-purple-400" />;
        if (mime.includes('pdf') || mime.includes('text')) return <FileText size={28} strokeWidth={1.5} className="text-orange-400" />;
        return <File size={28} strokeWidth={1.5} className="text-slate-400" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getCurrentPath = () => {
        const path = [];
        let curr = folders.find(f => f.id === currentFolderId);
        while(curr) {
            path.unshift(curr);
            curr = folders.find(f => f.id === curr?.parentId);
        }
        return path;
    };

    const toggleFolder = (id: string) => {
        const next = new Set(expandedFolders);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedFolders(next);
    };

    // --- Content Filtering & Sorting ---
    const filteredFiles = files.filter(f => f.folderId === currentFolderId).filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredFolders = folders.filter(f => f.parentId === currentFolderId).filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const sortFn = (a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        // Folders don't have size, fallback to 0
        if(sortBy === 'size' && !valA) valA = 0;
        if(sortBy === 'size' && !valB) valB = 0;
        
        if (typeof valA === 'string') {
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
    };

    const currentFiles = filteredFiles.sort(sortFn);
    const currentSubfolders = filteredFolders.sort(sortFn);

    // --- Subcomponents ---

    const FolderTreeItem: React.FC<{ folder: Folder, depth?: number }> = ({ folder, depth = 0 }) => {
        const isExpanded = expandedFolders.has(folder.id);
        const subFolders = folders.filter(f => f.parentId === folder.id);
        const isSelected = currentFolderId === folder.id;

        return (
            <div>
                <div 
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => setCurrentFolderId(folder.id)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, folder.id)}
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }} 
                        className={`p-0.5 rounded hover:bg-slate-700 ${subFolders.length === 0 ? 'invisible' : ''}`}
                    >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    {isExpanded ? <FolderOpen size={16} className={isSelected ? "text-blue-400" : "text-yellow-500"} /> : <FolderIcon size={16} className={isSelected ? "text-blue-400" : "text-slate-500"} />}
                    <span className="text-sm truncate">{folder.name}</span>
                </div>
                {isExpanded && subFolders.map(sub => (
                    <FolderTreeItem key={sub.id} folder={sub} depth={depth + 1} />
                ))}
            </div>
        );
    };

    return (
        <div className="flex h-full w-full font-sans relative overflow-hidden text-slate-200">
            
            {/* --- SIDEBAR --- */}
            <div className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col overflow-y-auto">
                <ToolHeader toolId="drive" lang={lang} icon={<HardDrive size={28} strokeWidth={1.5} />} />
                
                <div className="p-4 flex-1 overflow-y-auto">
                    <div 
                        className={`flex items-center gap-2 py-2 px-3 mb-1 rounded-lg cursor-pointer font-medium ${currentFolderId === 'root' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
                        onClick={() => setCurrentFolderId('root')}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, 'root')}
                    >
                        <HardDrive size={18} />
                        <span>My Drive</span>
                    </div>

                    <div className="mt-2 space-y-0.5">
                        {folders.filter(f => f.parentId === 'root').map(f => (
                            <FolderTreeItem key={f.id} folder={f} />
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800">
                     <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                         <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold text-slate-500 uppercase">Storage</span>
                             <span className="text-xs text-slate-300 font-mono">{formatSize(files.reduce((a, b) => a + b.size, 0))}</span>
                         </div>
                         <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-blue-500 h-full w-1/4 rounded-full"/>
                         </div>
                     </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-black/10">
                
                {/* Header / Toolbar */}
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/30 backdrop-blur shrink-0 z-10">
                    <div className="flex items-center gap-2 text-sm text-slate-400 overflow-hidden">
                        <button onClick={() => setCurrentFolderId('root')} className="hover:text-white flex items-center gap-1">
                            <HardDrive size={16}/> Root
                        </button>
                        {getCurrentPath().map(f => (
                            <React.Fragment key={f.id}>
                                <ChevronRight size={14} className="text-slate-600"/>
                                <button onClick={() => setCurrentFolderId(f.id)} className="hover:text-white font-medium truncate max-w-[150px]">
                                    {f.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group hidden md:block w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-parsam-400 transition-colors" size={16} />
                            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search current folder..." className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:border-parsam-500 outline-none text-white transition-all focus:bg-slate-900" />
                        </div>
                        
                        <div className="h-6 w-px bg-slate-700 mx-2"/>

                        {/* Sort Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-1.5 px-3 bg-slate-950/50 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-medium">
                                <ArrowUpDown size={14} /> 
                                <span className="hidden lg:inline">{sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : 'Size'}</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {['date', 'name', 'size'].map((opt) => (
                                    <button 
                                        key={opt} 
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 first:rounded-t-lg last:rounded-b-lg ${sortBy === opt ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
                                        onClick={() => { setSortBy(opt as any); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                                    >
                                        {opt.charAt(0).toUpperCase() + opt.slice(1)} {sortBy === opt && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Grid size={16} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><ListIcon size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Main View */}
                <div className="flex-1 overflow-y-auto p-6" onDragOver={onDragOver} onDrop={(e) => onDrop(e, currentFolderId)}>
                    
                    {/* Actions Bar */}
                    <div className="flex items-center gap-4 mb-6">
                        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-lg shadow-blue-900/20">
                            <Upload size={18} />
                            <span className="font-bold text-sm">Upload File</span>
                            <input type="file" className="hidden" onChange={handleUpload} />
                        </label>
                        
                        <div className="relative">
                            {!isCreatingFolder ? (
                                <button onClick={() => setIsCreatingFolder(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-700">
                                    <FolderPlus size={18} />
                                    <span className="font-medium text-sm">New Folder</span>
                                </button>
                            ) : (
                                <form onSubmit={handleCreateFolder} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                                    <input 
                                        autoFocus
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        placeholder="Folder Name"
                                        className="bg-slate-950 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none w-48"
                                        onBlur={() => { if(!newFolderName) setIsCreatingFolder(false); }}
                                    />
                                    <button type="submit" className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg"><CheckCircle size={16}/></button>
                                    <button type="button" onClick={() => setIsCreatingFolder(false)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-lg"><X size={16}/></button>
                                </form>
                            )}
                        </div>
                    </div>

                    {uploadProgress !== null && (
                        <div className="mb-6 bg-slate-800/80 rounded-xl p-4 flex items-center gap-4 border border-slate-700 animate-in fade-in">
                            <div className="p-2 bg-blue-900/50 rounded-lg text-blue-400"><Upload size={24} className="animate-bounce" /></div>
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1 font-medium text-slate-200"><span>Uploading...</span><span>{uploadProgress}%</span></div>
                                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} /></div>
                            </div>
                        </div>
                    )}

                    {/* Content Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {/* Folders */}
                            {currentSubfolders.map(folder => (
                                <div 
                                    key={folder.id} 
                                    className="group p-4 bg-slate-900/40 border border-slate-800 hover:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-800/60 transition-all flex flex-col items-center justify-center gap-2 relative"
                                    onClick={() => setCurrentFolderId(folder.id)}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, folder.id)}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, 'folder', folder.id)}
                                >
                                    <FolderIcon size={48} className="text-yellow-500/80 drop-shadow-lg" />
                                    {renamingItem?.id === folder.id ? (
                                        <input 
                                            autoFocus 
                                            value={renameText} 
                                            onChange={e => setRenameText(e.target.value)} 
                                            onBlur={finishRenaming} 
                                            onKeyDown={e => e.key === 'Enter' && finishRenaming()}
                                            onClick={e => e.stopPropagation()}
                                            className="bg-slate-950 border border-blue-500 rounded px-1 py-0.5 text-xs text-white text-center w-full"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-slate-300 truncate w-full text-center group-hover:text-white transition-colors">{folder.name}</span>
                                    )}
                                    
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); startRenaming(folder.id, 'folder', folder.name); }}
                                            className="p-1.5 text-slate-400 hover:text-white bg-slate-950/80 rounded hover:bg-blue-600 transition-colors"
                                            title="Rename"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                                            className="p-1.5 text-slate-400 hover:text-white bg-slate-950/80 rounded hover:bg-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Files */}
                            {currentFiles.map(file => (
                                <div 
                                    key={file.id} 
                                    className={`group relative p-4 bg-slate-900/40 border rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-slate-800/60 ${selectedFile?.id === file.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-800 hover:border-slate-600'}`}
                                    onClick={() => setSelectedFile(file)}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, 'file', file.id)}
                                >
                                    <div className="p-2 bg-slate-950/50 rounded-lg shadow-sm group-hover:scale-105 transition-transform">{getFileIcon(file.type)}</div>
                                    <div className="text-center w-full">
                                        {renamingItem?.id === file.id ? (
                                            <input 
                                                autoFocus 
                                                value={renameText} 
                                                onChange={e => setRenameText(e.target.value)} 
                                                onBlur={finishRenaming} 
                                                onKeyDown={e => e.key === 'Enter' && finishRenaming()}
                                                onClick={e => e.stopPropagation()}
                                                className="bg-slate-950 border border-blue-500 rounded px-1 py-0.5 text-xs text-white text-center w-full mb-1"
                                            />
                                        ) : (
                                            <div className="text-xs font-bold text-slate-200 truncate w-full mb-1">{file.name}</div>
                                        )}
                                        <div className="text-[10px] text-slate-500">{formatSize(file.size)}</div>
                                    </div>
                                    {file.isEncrypted && <Lock size={12} className="absolute top-3 right-3 text-amber-500" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {currentSubfolders.map(folder => (
                                <div 
                                    key={folder.id} 
                                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer border border-transparent hover:border-slate-700 transition-all"
                                    onClick={() => setCurrentFolderId(folder.id)}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, folder.id)}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, 'folder', folder.id)}
                                >
                                    <FolderIcon size={20} className="text-yellow-500" />
                                    {renamingItem?.id === folder.id ? (
                                        <input 
                                            autoFocus 
                                            value={renameText} 
                                            onChange={e => setRenameText(e.target.value)} 
                                            onBlur={finishRenaming} 
                                            onKeyDown={e => e.key === 'Enter' && finishRenaming()}
                                            onClick={e => e.stopPropagation()}
                                            className="bg-slate-950 border border-blue-500 rounded px-2 py-1 text-sm text-white flex-1"
                                        />
                                    ) : (
                                        <span className="text-sm text-slate-200 font-medium flex-1">{folder.name}</span>
                                    )}
                                    <span className="text-xs text-slate-600 w-24">Folder</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); startRenaming(folder.id, 'folder', folder.name); }}
                                            className="text-slate-500 hover:text-white"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                                            className="text-slate-500 hover:text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                             {currentFiles.map(file => (
                                <div 
                                    key={file.id} 
                                    className={`group flex items-center gap-4 p-3 rounded-lg cursor-pointer border transition-all ${selectedFile?.id === file.id ? 'bg-slate-800/80 border-blue-500/50' : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'}`}
                                    onClick={() => setSelectedFile(file)}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, 'file', file.id)}
                                >
                                     {getFileIcon(file.type)}
                                     {renamingItem?.id === file.id ? (
                                        <input 
                                            autoFocus 
                                            value={renameText} 
                                            onChange={e => setRenameText(e.target.value)} 
                                            onBlur={finishRenaming} 
                                            onKeyDown={e => e.key === 'Enter' && finishRenaming()}
                                            onClick={e => e.stopPropagation()}
                                            className="bg-slate-950 border border-blue-500 rounded px-2 py-1 text-sm text-white flex-1"
                                        />
                                     ) : (
                                        <span className="text-sm text-slate-200 font-medium flex-1 truncate">{file.name}</span>
                                     )}
                                     <span className="text-xs text-slate-500 w-24 text-right">{formatSize(file.size)}</span>
                                     <span className="text-xs text-slate-600 w-32 text-right">{new Date(file.createdAt).toLocaleDateString()}</span>
                                </div>
                             ))}
                        </div>
                    )}
                    
                    {currentFiles.length === 0 && currentSubfolders.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center mb-4">
                                <FolderIcon size={24} className="opacity-20"/>
                            </div>
                            <p className="text-sm font-medium">This folder is empty</p>
                            <p className="text-xs mt-1">Drag files here or use the upload button</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- File Details Sidebar --- */}
            {selectedFile && (
                <div className="w-80 bg-slate-900/90 border-l border-slate-800 flex flex-col backdrop-blur-md animate-in slide-in-from-right">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                         <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">{getFileIcon(selectedFile.type)}</div>
                         <button onClick={() => setSelectedFile(null)} className="text-slate-500 hover:text-white"><X size={20}/></button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="flex items-start justify-between mb-1 gap-2">
                            <h3 className="font-bold text-lg text-white break-all leading-tight">{selectedFile.name}</h3>
                            <button onClick={() => startRenaming(selectedFile.id, 'file', selectedFile.name)} className="mt-1 text-blue-400 hover:text-blue-300"><Edit2 size={16}/></button>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mb-6">{selectedFile.type}</p>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-950 p-3 rounded-lg">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Size</div>
                                    <div className="text-sm text-slate-300">{formatSize(selectedFile.size)}</div>
                                </div>
                                <div className="bg-slate-950 p-3 rounded-lg">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Created</div>
                                    <div className="text-sm text-slate-300">{new Date(selectedFile.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            
                            <Button className="w-full justify-center" onClick={() => setPreviewFile(selectedFile)} icon={<Eye size={16} />}>Preview</Button>
                            
                            <div className="pt-4 border-t border-slate-800 space-y-3">
                                 <button onClick={() => { StorageService.deleteDriveFile(selectedFile.id); refreshData(); setSelectedFile(null); }} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/10 p-2 rounded-lg transition-colors text-sm font-medium">
                                     <Trash2 size={16} /> Delete File
                                 </button>
                                 <a href={selectedFile.data} download={selectedFile.name} className="flex items-center justify-center gap-2 w-full py-2 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors text-slate-400">
                                     <Download size={14} /> Download
                                 </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Preview Modal --- */}
            {previewFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-6xl h-[85vh] flex flex-col">
                        <button onClick={() => setPreviewFile(null)} className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"><X size={32} /></button>
                        <div className="flex-1 flex items-center justify-center overflow-auto rounded-2xl bg-black/50 border border-slate-800/50 p-4">
                            {previewFile.type.startsWith('image/') ? <img src={previewFile.data} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" alt="preview" /> : previewFile.type.startsWith('video/') ? <video src={previewFile.data} controls className="max-w-full max-h-full rounded-lg" /> : <div className="text-slate-400">Preview not available</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
