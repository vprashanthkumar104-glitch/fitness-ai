import { User } from 'firebase/auth';
import { UserProfileData } from '../context/AuthContext';

export const N8N_WEBHOOK_URL = 'https://founder123.app.n8n.cloud/webhook/fitness-login';

export interface FitnessWebhookPayload {
  userId: string;
  name: string;
  email: string;
  fitnessGoal: string;
  experienceLevel: string;
  equipment: string;
  daysPerWeek: string;
  startDate: string;
}

export interface WebhookResult {
  success: boolean;
  message: string;
}

/**
 * Sends current user and fitness profile info to the n8n production webhook.
 */
export async function sendFitnessAutomationWebhook(
  user: User | null,
  userProfile: UserProfileData | null
): Promise<WebhookResult> {
  // 1. Unauthorized / Not logged-in check
  if (!user || !user.uid) {
    return {
      success: false,
      message: 'Unable to connect to Fitness AI automation. Please try again.'
    };
  }

  // 2. Validate missing user information
  const email = user.email || userProfile?.email;
  if (!email) {
    return {
      success: false,
      message: 'Unable to connect to Fitness AI automation. Please try again.'
    };
  }

  const name = userProfile?.displayName || user.displayName || 'Athlete';
  const fitnessGoal = userProfile?.fitnessGoal || 'Muscle Building & Hypertrophy';
  const experienceLevel = userProfile?.fitnessLevel || 'Intermediate';
  const equipment = userProfile?.equipment || 'Full Gym & Free Weights';
  const daysPerWeek = String(userProfile?.daysPerWeek || '4-5 Days/Week');
  const startDate =
    userProfile?.startDate ||
    userProfile?.createdAt?.split('T')[0] ||
    new Date().toISOString().split('T')[0];

  const payload: FitnessWebhookPayload = {
    userId: user.uid,
    name,
    email,
    fitnessGoal,
    experienceLevel,
    equipment,
    daysPerWeek,
    startDate
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let data: any = null;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (response.ok && data?.success === true) {
      return {
        success: true,
        message: 'Fitness AI automation started successfully.'
      };
    } else {
      return {
        success: false,
        message: 'Unable to connect to Fitness AI automation. Please try again.'
      };
    }
  } catch (error) {
    console.error('N8N Webhook error:', error);
    return {
      success: false,
      message: 'Unable to connect to Fitness AI automation. Please try again.'
    };
  }
}
