
import { AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dispatch, SetStateAction } from "react";

interface AlertMessageProps {
  showAlert: boolean;
  setShowAlert: (show: boolean) => void;
  alertMessage: string;
}

export const AlertMessage = ({ 
  showAlert, 
  setShowAlert, 
  alertMessage 
}: AlertMessageProps) => {
  return (
    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
      <AlertDialogContent className="border-none shadow-xl bg-white rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <span>Attention</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-gray-600">
            {alertMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border-none transition-all duration-300">Got it</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
