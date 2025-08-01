import { MediaFile } from '@/types';

const STORAGE_FILE = 'media_storage.json';

export class FileStorage {
  private static instance: FileStorage;
  private data: { [key: string]: MediaFile[] } = {};

  private constructor() {
    this.loadData();
  }

  static getInstance(): FileStorage {
    if (!FileStorage.instance) {
      FileStorage.instance = new FileStorage();
    }
    return FileStorage.instance;
  }

  private loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_FILE);
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.data = {};
    }
  }

  private saveData() {
    try {
      const jsonString = JSON.stringify(this.data);
      localStorage.setItem(STORAGE_FILE, jsonString);
      
      // Também criar um arquivo para download se necessário
      this.downloadBackup();
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      // Se localStorage falhar, usar um sistema alternativo
      this.saveToIndexedDB();
    }
  }

  private saveToIndexedDB() {
    // Fallback para IndexedDB se localStorage estiver cheio
    const request = indexedDB.open('MediaStorage', 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media');
      }
    };
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      store.put(this.data, 'allMedia');
    };
  }

  private downloadBackup() {
    try {
      const dataStr = JSON.stringify(this.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar link para download automático do backup
      const link = document.createElement('a');
      link.href = url;
      link.download = `media_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Auto download apenas uma vez por dia
      const lastBackup = localStorage.getItem('lastBackupDate');
      const today = new Date().toISOString().split('T')[0];
      if (lastBackup !== today) {
        localStorage.setItem('lastBackupDate', today);
        // Uncomment para download automático: link.click();
      }
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    }
  }

  getAllFiles(): MediaFile[] {
    const allFiles: MediaFile[] = [];
    Object.values(this.data).forEach(folderFiles => {
      allFiles.push(...folderFiles);
    });
    return allFiles;
  }

  getFilesByFolder(folder: string): MediaFile[] {
    return this.data[folder.toLowerCase()] || [];
  }

  getFilesByClient(client: string): MediaFile[] {
    return this.getAllFiles().filter(file => file.client === client);
  }

  addFiles(folder: string, files: MediaFile[]) {
    const folderKey = folder.toLowerCase();
    if (!this.data[folderKey]) {
      this.data[folderKey] = [];
    }
    this.data[folderKey].push(...files);
    this.saveData();
  }

  updateFile(fileId: string, updatedFile: MediaFile) {
    Object.keys(this.data).forEach(folder => {
      const index = this.data[folder].findIndex(f => f.id === fileId);
      if (index !== -1) {
        // Remove from old folder
        this.data[folder].splice(index, 1);
      }
    });
    
    // Add to new folder
    const newFolder = updatedFile.folder.toLowerCase();
    if (!this.data[newFolder]) {
      this.data[newFolder] = [];
    }
    this.data[newFolder].push(updatedFile);
    this.saveData();
  }

  deleteFile(fileId: string) {
    Object.keys(this.data).forEach(folder => {
      this.data[folder] = this.data[folder].filter(f => f.id !== fileId);
    });
    this.saveData();
  }

  checkFileExists(fileName: string, folder: string): boolean {
    const folderFiles = this.getFilesByFolder(folder);
    return folderFiles.some(file => file.name === fileName);
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string) {
    try {
      this.data = JSON.parse(jsonData);
      this.saveData();
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw new Error('Formato de arquivo inválido');
    }
  }
}

export const fileStorage = FileStorage.getInstance();