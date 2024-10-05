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
};

const AlertDialog = ({
  title,
  description,
  cancelBtnTitle,
  actionBtnTitle,
  showAlertDialog,
  setShowAlertDialog,
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
          <AlertDialogAction>{actionBtnTitle}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </SystemAlertDialog>
  );
};

export default AlertDialog;
