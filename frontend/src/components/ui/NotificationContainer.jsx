import React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { NOTIFICATION_TYPES } from "../../utils/constants";

const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications || notifications.length === 0) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle size={20} className="text-green-600" />;
      case NOTIFICATION_TYPES.ERROR:
        return <AlertCircle size={20} className="text-red-600" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle size={20} className="text-yellow-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return "bg-green-50 border-green-200 text-green-800";
      case NOTIFICATION_TYPES.ERROR:
        return "bg-red-50 border-red-200 text-red-800";
      case NOTIFICATION_TYPES.WARNING:
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 border rounded-lg shadow-lg
            animate-in slide-in-from-right duration-300
            ${getNotificationStyles(notification.type)}
          `}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Message */}
            <div className="flex-1 text-sm">{notification.message}</div>

            {/* Close Button */}
            <button
              onClick={() => onRemove(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
