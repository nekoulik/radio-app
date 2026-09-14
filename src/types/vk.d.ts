// src/types/vk.d.ts
export interface VKBridge {
    send(method: string, params?: any): Promise<any>;
    subscribe(event: string, handler: (data: any) => void): void;
    unsubscribe(event: string, handler: (data: any) => void): void;
}

declare global {
    interface Window {
        vkBridge?: VKBridge;
    }
}