import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Bell, X, Check, Trash2, Heart, MessageCircle, UserPlus, Video, AtSign } from 'lucide-react';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'reply':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'subscription':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'upload':
        return <Video className="w-5 h-5 text-orange-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`} />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-full shadow-lg"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Pulse animation for unread */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full animate-ping opacity-75" />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed md:absolute left-2 right-2 md:left-auto md:right-0 top-[60px] md:top-auto md:mt-2 w-auto md:w-[420px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[60] max-h-[calc(100vh-70px)] md:max-h-[580px] overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Check className="w-4 h-4" />
                      Mark all read
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600"></div>
                    <Bell className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400"
                >
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                      <Bell className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No notifications yet</h4>
                  <p className="text-sm text-center">When you get notifications, they'll show up here</p>
                </motion.div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                        !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon with gradient background */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-sm">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={notification.actionUrl || '/'}
                            onClick={() => handleNotificationClick(notification)}
                            className="block"
                          >
                            {/* Sender Info */}
                            <div className="flex items-center gap-2 mb-1.5">
                              {notification.sender?.avatar && (
                                <img
                                  src={notification.sender.avatar}
                                  alt={notification.sender.username}
                                  className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                                />
                              )}
                              <span className="font-bold text-sm text-gray-900 dark:text-white">
                                {notification.sender?.fullname || 'Someone'}
                              </span>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>

                            {/* Notification Content */}
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {notification.content}
                            </p>

                            {/* Timestamp */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                              <span>⏱</span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true
                              })}
                            </p>
                          </Link>
                        </div>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteNotification(notification._id)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Show when there are notifications */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium block text-center"
                >
                  View all notifications →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
