
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// Initialize Client
// We use a factory function or lazy initialization to avoid crashing if keys are missing during development
let supabase: any = null;

const getSupabase = () => {
    if (supabase) return supabase;
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
            supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return supabase;
        } catch (e) {
            console.error("Failed to init Supabase", e);
            return null;
        }
    }
    return null;
}

export const saveFeedbackToDb = async (
    status: 'Correct' | 'Incorrect', 
    feedbackText: string, 
    stageContext: string
) => {
    const client = getSupabase();
    
    // Fallback if DB is not configured (Developer Mode)
    if (!client) {
        console.warn("MOCK DB SAVE: Supabase keys missing in constants.ts");
        console.log("Payload:", { status, feedbackText, stageContext });
        return { success: true, message: "Mock saved (configure DB to persist)" };
    }

    try {
        const { data, error } = await client
            .from('feedback')
            .insert([
                { 
                    status: status, 
                    feedback_text: feedbackText, 
                    stage_context: stageContext 
                },
            ])
            .select();

        if (error) {
            console.error("Supabase Error:", error);
            return { success: false, message: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("DB Save Error:", error);
        return { success: false, message: "Network error saving feedback" };
    }
};
