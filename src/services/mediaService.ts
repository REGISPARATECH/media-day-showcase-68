import { supabase } from '@/integrations/supabase/client';

export interface MediaFile {
  id: string;
  original_name: string;
  file_name: string;
  file_type: string;
  file_size: number;
  folder: string;
  url: string;
  hidden: boolean;
  animation_type?: string;
  animation_duration?: number;
  created_at: string;
  updated_at: string;
}

export const mediaService = {
  async getAllMediaFiles(): Promise<MediaFile[]> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar arquivos de mídia:', error);
      throw error;
    }
    
    return data || [];
  },

  async uploadFile(file: File, folder: string, animationType?: string, animationDuration?: number): Promise<MediaFile> {
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload do arquivo para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);

      // Salvar informações do arquivo na tabela
      const mediaFileData = {
        original_name: file.name,
        file_name: fileName,
        file_type: file.type,
        file_size: file.size,
        folder: folder,
        url: urlData.publicUrl,
        hidden: false,
        animation_type: animationType,
        animation_duration: animationDuration
      };

      const { data, error } = await supabase
        .from('media_files')
        .insert([mediaFileData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar informações do arquivo:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no upload do arquivo:', error);
      throw error;
    }
  },

  async updateMediaFile(id: string, updates: Partial<Omit<MediaFile, 'id' | 'created_at' | 'updated_at'>>): Promise<MediaFile> {
    const { data, error } = await supabase
      .from('media_files')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar arquivo de mídia:', error);
      throw error;
    }
    
    return data;
  },

  async deleteMediaFile(id: string): Promise<void> {
    try {
      // Primeiro, obter informações do arquivo para deletar do storage
      const { data: mediaFile, error: fetchError } = await supabase
        .from('media_files')
        .select('file_name, folder')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar arquivo para deletar:', fetchError);
        throw fetchError;
      }

      // Deletar do storage
      const filePath = `${mediaFile.folder}/${mediaFile.file_name}`;
      const { error: storageError } = await supabase.storage
        .from('media-files')
        .remove([filePath]);

      if (storageError) {
        console.error('Erro ao deletar arquivo do storage:', storageError);
        // Continuar mesmo se houver erro no storage
      }

      // Deletar da tabela
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Erro ao deletar arquivo da tabela:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo de mídia:', error);
      throw error;
    }
  },

  async toggleVisibility(id: string, hidden: boolean): Promise<MediaFile> {
    return this.updateMediaFile(id, { hidden });
  },

  async updateFolder(id: string, folder: string): Promise<MediaFile> {
    return this.updateMediaFile(id, { folder });
  }
};