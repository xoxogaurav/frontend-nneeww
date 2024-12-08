import Pushy from 'pushy-sdk-web';

class PushNotificationService {
  private static instance: PushNotificationService;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  public async initialize(): Promise<string> {
    if (this.initialized) {
      return '';
    }

    try {
      // Register device for push notifications
      const deviceToken = await Pushy.register({ 
        appId: '6750c3d37a327a8229eef8cd'
      });

      // Subscribe to default topics
      await this.subscribeToDefaultTopics();

      this.initialized = true;
      return deviceToken;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      if (!Pushy.isRegistered()) {
        throw new Error('Push notifications not initialized');
      }

      await Pushy.subscribe(topic);
      console.log(`Successfully subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      if (!Pushy.isRegistered()) {
        throw new Error('Push notifications not initialized');
      }

      await Pushy.unsubscribe(topic);
      console.log(`Successfully unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error);
      throw error;
    }
  }

  private async subscribeToDefaultTopics(): Promise<void> {
    try {
      // Subscribe to default topics
      await Promise.all([
        this.subscribeToTopic('tasks')
      ]);
    } catch (error) {
      console.error('Failed to subscribe to default topics:', error);
      throw error;
    }
  }

  public isInitialized(): boolean {
    return this.initialized && Pushy.isRegistered();
  }
}

export default PushNotificationService.getInstance();