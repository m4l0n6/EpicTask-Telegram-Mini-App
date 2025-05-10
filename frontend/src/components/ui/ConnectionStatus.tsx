import React from 'react';
import { useSocket } from "@/contexts/SocketContext";
import { Wifi, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ConnectionStatus: React.FC = () => {
  const { connected } = useSocket();
  console.log("ConnectionStatus rendering, connected:", connected);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`flex items-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
            {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{connected ? 'Connected to server' : 'Disconnected from server'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatus;