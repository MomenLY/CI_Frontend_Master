import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { GetBillboardAnalytics } from './components/expoPreview/billBoard/apis/Get-Billboard-Analytics';
import { GetBoothAnalytics } from './components/expoPreview/billBoard/apis/Get-Booth-Analytics';
import LocalCache from 'src/utils/localCache';

type AnalyticsContextType = {
    trackEvent: (expoId: string, type: string, data: any) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

type Props = {
    children?: React.ReactNode;
    trackingId: string;
    userInfo: { userId?: string } | null;
    isAuthenticated: boolean;
    analyticsEndpoint?: string;
};

export const AnalyticsProvider = ({ children, trackingId, userInfo, isAuthenticated, analyticsEndpoint = '/analytics' }: Props) => {
    const sessionId = useRef<string>(`session-${Math.random().toString(36).substr(2, 9)}`);
    const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
    const storageKey = 'app_userTrackingData';

    useEffect(() => {
        const initAnalytics = () => {
            if (!hasUserIdentifier()) {
                const identifier = generateUserIdentifier();
                setUserIdentifier(identifier);
                storeUserIdentifier(identifier);
                sendFirstTimeData(identifier);
            } else {
                const identifier = getUserIdentifier();
                setUserIdentifier(identifier);
            }
            trackUniquePageView();
        };

        initAnalytics();
    }, [trackingId, userInfo, isAuthenticated]);

    const generateUserIdentifier = () => {
        if (isAuthenticated && userInfo?.userId) {
            return `auth-user-${userInfo.userId}`;
        }
        return `anon-user-${Math.random().toString(36).substr(2, 9)}`;
    };

    const storeUserIdentifier = (identifier: string) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify({ identifier, userInfo }));
        } catch (error) {
            console.error('Error storing user identifier:', error);
        }
    };

    const hasUserIdentifier = () => {
        try {
            return !!localStorage.getItem(storageKey);
        } catch {
            return false;
        }
    };

    const getUserIdentifier = () => {
        try {
            const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
            return data.identifier || null;
        } catch {
            return null;
        }
    };

    const sendFirstTimeData = (identifier: string) => {
        sendData({
            eventType: 'firstEvent',
            userIdentifier: identifier,
            userInfo,
            timestamp: new Date().toISOString(),
        });
    };

    const sendData = async (data: any) => {
        const now = Date.now();

        const isWithin15Minutes = (lastUpdated: number) => (now - lastUpdated) < 15 * 60 * 1000;
        if (data.type === 'Billboard') {
            const billboardlocalCacheKey = `billboardCache_${data.data.details.billboardId}_${data.expoId}`;
            const billboardCache = await LocalCache.getItem(billboardlocalCacheKey) || '{}';
            if (!billboardCache.lastUpdated || !isWithin15Minutes(billboardCache.lastUpdated)) {
                const billboardData = {
                    type: 'billboardData',
                    lastUpdated: now,
                };

                await LocalCache.setItem(billboardlocalCacheKey, billboardData)
                const payload = {
                    "biExpoCode": data.expoId,
                    "biDetails": data.data,
                    "biTrackingId": data.expoId + new Date().toISOString(),
                    "biSessionId": 'Session-' + new Date().toISOString()
                }

                const response = await GetBillboardAnalytics(payload);
            } else {
            }
        } else if (data.type === 'Booth') {
            const boothlocalCacheKey = `booth_${data?.data?.details?.boothId}_${data.expoId}`;
            const boothCache = await LocalCache.getItem(boothlocalCacheKey) || '{}';
            if (!boothCache.lastUpdated || !isWithin15Minutes(boothCache.lastUpdated)) {
                const boothData = {
                    type: 'boothData',
                    lastUpdated: now,
                };

                await LocalCache.setItem(boothlocalCacheKey, boothData)
                const payload = {
                    "boExpoCode": data.expoId,
                    "boDetails": data.data,
                    "boSessionId": 'Session-' + new Date().toISOString(),
                    "boTrackingId": data.expoId + new Date().toISOString()
                }
                const response = await GetBoothAnalytics(payload);
            } else {
            }
        }
    };

    const trackUniquePageView = () => {
        if (!hasVisitedPage()) {
            sendData({
                eventType: 'uniquePageview',
                url: window.location.href,
                timestamp: new Date().toISOString(),
            });
            markPageAsVisited();
        }
    };

    const markPageAsVisited = () => {
        try {
            const visits = JSON.parse(localStorage.getItem('uniquePageVisits') || '{}');
            visits[window.location.href] = true;
            localStorage.setItem('uniquePageVisits', JSON.stringify(visits));
        } catch (error) {
            console.error('Error marking page as visited:', error);
        }
    };

    const hasVisitedPage = () => {
        try {
            const visits = JSON.parse(localStorage.getItem('uniquePageVisits') || '{}');
            return visits[window.location.href] === true;
        } catch {
            return false;
        }
    };

    const trackEvent = (expoId: string, type: string, data: any) => {
        sendData({ expoId, type, data })
    }

    return (
        <AnalyticsContext.Provider value={{ trackEvent }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};
