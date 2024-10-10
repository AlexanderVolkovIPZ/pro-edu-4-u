import { Dispatch, SetStateAction } from 'react';
import {
  AlertDialog as SystemAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

type AlertDialogProps = {
  title: string;
  description: string;
  cancelBtnTitle: string;
  actionBtnTitle: string;
  showAlertDialog: boolean;
  setShowAlertDialog: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
};

const AlertDialog = ({
  title,
  description,
  cancelBtnTitle,
  actionBtnTitle,
  showAlertDialog,
  setShowAlertDialog,
  onConfirm,
}: AlertDialogProps) => {
  return (
    <SystemAlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowAlertDialog(false)}>{cancelBtnTitle}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{actionBtnTitle}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </SystemAlertDialog>
  );
};

export default AlertDialog;
