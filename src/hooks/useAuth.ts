import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useAuth] Initializing auth check...');

    const timeoutId = setTimeout(() => {
      console.log('[useAuth] Timeout reached (3s), forcing loading to false');
      setLoading(false);
    }, 3000);

    checkUser().finally(() => {
      clearTimeout(timeoutId);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] Auth state changed:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        (async () => {
          await loadUserProfile(session.user.id);
        })();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      console.log('[checkUser] Getting session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[checkUser] Session error:', sessionError);
        throw sessionError;
      }

      console.log('[checkUser] Session retrieved:', session ? 'exists' : 'no session');

      if (session?.user) {
        console.log('[checkUser] User found, loading profile...');
        await loadUserProfile(session.user.id);
      } else {
        console.log('[checkUser] No user session found');
      }
    } catch (error) {
      console.error('[checkUser] Error checking user:', error);
    } finally {
      console.log('[checkUser] Setting loading to false');
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('[loadUserProfile] Loading profile for user:', userId);

      const { data: authUser } = await supabase.auth.getUser();
      const userEmail = authUser?.user?.email;

      if (!userEmail) {
        console.error('[loadUserProfile] Cannot get user email');
        return;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[loadUserProfile] Profile query error:', error);
        throw error;
      }

      console.log('[loadUserProfile] Profile data:', profile ? 'found' : 'not found');

      if (!profile) {
        console.log('[loadUserProfile] No profile found, creating new profile...');

        const newProfile = {
          id: userId,
          email: userEmail,
          full_name: userEmail.split('@')[0],
          role: 'viewer',
          avatar_url: null,
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) {
          console.error('[loadUserProfile] Error creating profile:', insertError);
          throw insertError;
        }

        console.log('[loadUserProfile] Profile created successfully:', createdProfile);

        const userData: User = {
          id: createdProfile.id,
          email: createdProfile.email,
          full_name: createdProfile.full_name,
          role: createdProfile.role,
          avatar_url: createdProfile.avatar_url,
        };
        console.log('[loadUserProfile] Setting user data:', userData);
        setUser(userData);
      } else {
        const userData: User = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || profile.email.split('@')[0],
          role: profile.role,
          avatar_url: profile.avatar_url,
        };
        console.log('[loadUserProfile] Setting user data:', userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('[loadUserProfile] Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Failed to create account' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message || 'Failed to create account' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Failed to sign in' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'Failed to sign in' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { user, loading, signUp, signIn, signOut };
}
