
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserRole, useAuth } from '@/context/AuthContext';

interface RoleSwitchProps {
  isVehicleOwner: boolean;
  onRoleChange: (checked: boolean) => void;
}

const RoleSwitch: React.FC<RoleSwitchProps> = ({ isVehicleOwner, onRoleChange }) => {
  return (
    <div className="flex justify-between items-center">
      <Label htmlFor="role-switch">User Mode</Label>
      <div className="flex items-center gap-2">
        <span className={!isVehicleOwner ? 'font-medium' : 'text-gray-500'}>Space Owner</span>
        <Switch 
          id="role-switch" 
          checked={isVehicleOwner}
          onCheckedChange={onRoleChange}
        />
        <span className={isVehicleOwner ? 'font-medium' : 'text-gray-500'}>Vehicle Owner</span>
      </div>
    </div>
  );
};

export default RoleSwitch;
