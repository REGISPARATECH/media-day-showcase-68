import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FileConflictDialogProps {
  isOpen: boolean;
  fileName: string;
  onReplace: () => void;
  onCancel: () => void;
}

export function FileConflictDialog({ 
  isOpen, 
  fileName, 
  onReplace, 
  onCancel 
}: FileConflictDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arquivo já existe</AlertDialogTitle>
          <AlertDialogDescription>
            O arquivo <strong>{fileName}</strong> já existe nesta pasta. 
            Deseja substituir o arquivo existente?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onReplace}>
            Substituir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}