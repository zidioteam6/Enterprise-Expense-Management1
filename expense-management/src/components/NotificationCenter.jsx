import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const NotificationCenter = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [stompClient, setStompClient] = useState(null);
    const [processedMessages] = useState(new Set()); // Track processed messages

    // Memoize the notification handler to prevent recreation
    const handleNotification = useCallback((message) => {
        try {
            // Check if we've already processed this message
            if (processedMessages.has(message.body)) {
                console.log('Skipping duplicate notification:', message.body);
                return;
            }

            const notification = {
                id: Date.now(),
                message: message.body,
                timestamp: new Date(),
                read: false
            };
            
            // Add message to processed set
            processedMessages.add(message.body);
            
            // Clean up old messages from processed set (keep last 100)
            if (processedMessages.size > 100) {
                const oldestMessage = Array.from(processedMessages)[0];
                processedMessages.delete(oldestMessage);
            }

            setNotifications(prev => {
                // Check if we already have this exact message
                const isDuplicate = prev.some(n => n.message === message.body);
                if (isDuplicate) {
                    console.log('Skipping duplicate notification in state:', message.body);
                    return prev;
                }
                return [notification, ...prev].slice(0, 50); // Keep last 50 notifications
            });
            
            // Play notification sound if browser supports it
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Notification', {
                    body: message.body
                });
            }
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    }, [processedMessages]);

    useEffect(() => {
        // Initialize WebSocket connection
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                
                // Clear any existing subscriptions
                if (client.connected) {
                    client.unsubscribe('/topic/auto-approved');
                    client.unsubscribe('/topic/approved');
                    client.unsubscribe('/topic/rejected');
                    client.unsubscribe('/topic/status-updates');
                    if (userId) {
                        client.unsubscribe(`/user/${userId}/notifications`);
                    }
                }

                // Subscribe to user-specific notifications if userId is provided
                if (userId) {
                    console.log('Subscribing to user notifications:', userId);
                    client.subscribe(`/user/${userId}/notifications`, handleNotification);
                } else {
                    // Subscribe to general topics only if no userId
                    console.log('Subscribing to general topics');
                    client.subscribe('/topic/auto-approved', handleNotification);
                    client.subscribe('/topic/approved', handleNotification);
                    client.subscribe('/topic/rejected', handleNotification);
                    client.subscribe('/topic/status-updates', handleNotification);
                }
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                // Clear processed messages on disconnect
                processedMessages.clear();
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            }
        });

        client.activate();
        setStompClient(client);

        // Cleanup function
        return () => {
            if (client && client.connected) {
                // Unsubscribe from all topics
                client.unsubscribe('/topic/auto-approved');
                client.unsubscribe('/topic/approved');
                client.unsubscribe('/topic/rejected');
                client.unsubscribe('/topic/status-updates');
                if (userId) {
                    client.unsubscribe(`/user/${userId}/notifications`);
                }
                client.deactivate();
            }
            // Clear processed messages on unmount
            processedMessages.clear();
        };
    }, [userId, handleNotification]);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const removeNotification = (id) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== id)
        );
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notification-center">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="notification-bell"
                aria-label="Toggle notifications"
            >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Notifications</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAllNotifications}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Clear all
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="notification-list max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="notification-content">
                                        <p className="notification-message">
                                            {notification.message}
                                        </p>
                                        <span className="notification-time">
                                            {new Date(notification.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeNotification(notification.id);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter; 