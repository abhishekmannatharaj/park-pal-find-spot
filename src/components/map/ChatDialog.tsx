
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spotName: string;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onOpenChange, spotName }) => {
  const [chatMessage, setChatMessage] = useState('');
  
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // In a real app, this would send the message to the owner
      setChatMessage('');
      // Mock a response
      setTimeout(() => {
        onOpenChange(false);
        alert('Message sent to the spot owner. They will respond shortly.');
      }, 500);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md w-[95vw] md:w-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Chat with {spotName} Owner</AlertDialogTitle>
          <AlertDialogDescription>
            Send a message to the spot owner. They will respond to your inquiries shortly.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="border rounded-md p-4 bg-gray-50 h-40 overflow-y-auto">
            <p className="text-sm text-gray-500 italic">Start a conversation with the spot owner...</p>
          </div>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Type your message..." 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
              Send
            </Button>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ChatDialog;
