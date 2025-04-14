import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2 } from 'lucide-react';

export interface PaymentMethodCardProps {
  method?: any;
  onEdit?: (method: any) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  title?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  isActive?: boolean;
  onToggle?: (active: boolean) => void;
  isConfigured?: boolean;
  onConfigure?: () => void;
  imageSrc?: string;
  provider?: string;
  ownerId?: string;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ 
  method,
  onEdit,
  onToggleActive,
  onDelete,
  title = '',
  description = '',
  icon: Icon,
  isActive = false,
  onToggle,
  isConfigured = false,
  onConfigure,
  imageSrc,
  provider,
  ownerId
}) => {
  if (!method && !title) return null;
  
  const handleToggleActive = () => {
    if (onToggleActive && method) {
      onToggleActive(method.id, !method.is_active);
    }
  };
  
  const handleEdit = () => {
    if (onEdit && method) {
      onEdit(method);
    }
  };
  
  const handleDelete = () => {
    if (onDelete && method) {
      onDelete(method.id);
    }
  };
  
  const getProviderIcon = (provider?: string) => {
    switch(provider?.toLowerCase()) {
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'crypto':
        return '₿';
      case 'manual':
        return '📝';
      default:
        return '💰';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {Icon ? <Icon size={24} className="mr-2" /> : <span className="text-2xl">{getProviderIcon(provider || method?.provider)}</span>}
            <CardTitle className="text-lg">{title || method?.provider}</CardTitle>
          </div>
          <Badge variant={isActive || method?.is_active ? "success" : "secondary"}>
            {isActive || method?.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Configuration</h4>
            <p className="text-sm mt-1 truncate">
              {isConfigured || (Object.keys(method?.config || {}).length > 0) 
                ? `${isConfigured ? 'Configured' : Object.keys(method?.config || {}).length} field(s) configured` 
                : 'No configuration set'}
            </p>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <Switch 
                checked={isActive || method?.is_active} 
                onCheckedChange={onToggle || handleToggleActive}
                id={`toggle-${method?.id}`}
              />
              <label 
                htmlFor={`toggle-${method?.id}`}
                className="text-sm text-gray-500 cursor-pointer"
              >
                {isActive || method?.is_active ? 'Enabled' : 'Disabled'}
              </label>
            </div>
            
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEdit}
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} className="mr-1" />
                  Remove
                </Button>
              )}
              {onConfigure && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={onConfigure}
                >
                  Configure
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
