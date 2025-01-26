// app/context/SupabaseProvider.tsx

import { Session, User, SupabaseClient } from "@supabase/supabase-js";
import { useRouter, useSegments, SplashScreen } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../config/supabase"; // Adjusted to relative path
import { Alert } from "react-native";

SplashScreen.preventAutoHideAsync();

type ChallengeDetails = {
  id: string;
  title: string;
  description: string;
  category: string;
  is_seasonal: boolean;
  is_sponsored: boolean;
  created_at: string;
  updated_at: string;
  // Add other relevant fields as needed
};

type UserDetails = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  bio: string;
  location: string;
  created_at: string;
  updated_at: string;
  // Add other relevant fields as needed
};

type Submission = {
  id: string;
  video_url: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  challenge_id: string;
  creator: UserProfile; // Alias for user_id
  challenge: Challenge; // Alias for challenge_id
};

type UserProfile = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
};

type Challenge = {
  id: string;
  title: string;
};

type SupabaseContextProps = {
  auth: SupabaseClient["auth"]; // Properly typed auth property
  user: User | null;
  session: Session | null;
  initialized: boolean;
  signUp: (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
    birthday: Date,
    userType: "standard" | "minor",
    parentEmail?: string,
    referralCode?: string,
  ) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  likes: any[];
  followers: any[];
  following: any[];
  friends: any[];
  joinedChallenges: any[]; // **New State for Joined Challenges**
  getLike: (userId: string) => Promise<void>;
  getFollowers: (userId: string) => Promise<void>;
  getFollowing: (userId: string) => Promise<void>;
  getFriends: () => Promise<void>;
  getJoinedChallenges: (userId: string) => Promise<void>; // **New Function**
  joinChallenge: (challengeId: string) => Promise<void>; // **Updated Function Parameter**
  followUser: (targetUserId: string) => Promise<void>;
  getUsers: (searchTerm: string) => Promise<UserDetails[]>;
  getChallenges: (searchTerm: string) => Promise<ChallengeDetails[]>;
  getSubmissions: (
    searchTerm: string,
    page?: number,
    limit?: number,
  ) => Promise<Submission[]>;
};

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  auth: supabase.auth, // Properly typed auth property
  user: null,
  session: null,
  initialized: false,
  signUp: async () => {},
  signInWithPassword: async () => {},
  signOut: async () => {},
  likes: [],
  followers: [],
  following: [],
  friends: [],
  joinedChallenges: [], // **Initialize Joined Challenges**
  getLike: async () => {},
  getFollowers: async () => {},
  getFollowing: async () => {},
  getFriends: async () => {},
  getJoinedChallenges: async () => {}, // **Initialize Function**
  joinChallenge: async () => {}, // **Initialize Function**
  followUser: async () => {},
  getUsers: async () => [],
  getChallenges: async () => [],
  getSubmissions: async () => [],
});

export const useSupabase = () => useContext(SupabaseContext);

// **Added useAuth Hook**
export const useAuth = () => useSupabase();

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const router = useRouter();
  const segments = useSegments();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const [likes, setLikes] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  // **New State for Joined Challenges**
  const [joinedChallenges, setJoinedChallenges] = useState<any[]>([]);

  const signUp = async (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
    birthday: Date,
    userType: "standard" | "minor",
    parentEmail?: string,
    referralCode?: string,
  ) => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: username.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName, // Adding full_name to user_metadata
          phone_number: phoneNumber.trim(),
          role: userType,
        },
      },
    });
    if (error) {
      throw error;
    }

    if (data.user) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          username: username.trim(),
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phoneNumber.trim(),
          role: userType,
          birthday: birthday,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      if (userType === "minor" && parentEmail) {
        const { data: parentUser, error: parentError } = await supabase
          .from("users")
          .select("*")
          .eq("email", parentEmail.trim())
          .single();

        if (parentError || !parentUser) {
          Alert.alert(
            "Parental Consent Error",
            "Parent email not found. Please ensure your parent has an account.",
          );
          return;
        }

        const { error: consentError } = await supabase
          .from("parental_controls")
          .insert([
            {
              parent_id: parentUser.id,
              child_id: data.user.id,
              consent_given: false,
            },
          ]);

        if (consentError) {
          throw consentError;
        }

        Alert.alert(
          "Account Created",
          "Account created successfully! Please wait for your parent's consent.",
        );
      } else {
        Alert.alert("Success", "Account created successfully!");
      }

      if (referralCode && referralCode.trim().length > 0) {
        // Attempt to find the user who owns this referralCode
        // Assuming referralCode is the referrer's user ID
        const { data: referrer, error: referrerError } = await supabase
          .from("users")
          .select("id, coins, total_coins_earned")
          .eq("id", referralCode.trim()) // user’s ID is the code
          .single();

        if (referrerError) {
          console.error("Referral code error:", referrerError.message);
        } else if (referrer) {
          // If valid, insert a record in "referrals" table
          const { error: referralInsertError } = await supabase
            .from("referrals")
            .insert([
              {
                referrer_id: referrer.id,
                referee_id: data.user.id,
              },
            ]);

          if (referralInsertError) {
            console.error(
              "Error inserting referral record:",
              referralInsertError.message,
            );
          } else {
            // Update coin balances:
            // Referrer: +30 coins
            // Referee (this newly signed-up user): +20 coins
            const { error: referrerCoinError } = await supabase
              .from("users")
              .update({
                coins: (referrer.coins || 0) + 30,
                total_coins_earned: (referrer.total_coins_earned || 0) + 30,
              })
              .eq("id", referrer.id);

            if (referrerCoinError) {
              console.error(
                "Error updating referrer coins:",
                referrerCoinError.message,
              );
            }

            // Now update the new user’s coins
            const { data: newUserData, error: newUserError } = await supabase
              .from("users")
              .select("coins, total_coins_earned")
              .eq("id", data.user.id)
              .single();

            if (!newUserError && newUserData) {
              const { coins, total_coins_earned } = newUserData;
              const { error: newUserCoinError } = await supabase
                .from("users")
                .update({
                  coins: (coins || 0) + 20,
                  total_coins_earned: (total_coins_earned || 0) + 20,
                })
                .eq("id", data.user.id);

              if (newUserCoinError) {
                console.error(
                  "Error updating new user coins:",
                  newUserCoinError.message,
                );
              }
            }
          }
        }
      }
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      router.replace("/(app)/(protected)");

      // **Fetch Joined Challenges upon Sign In**
      await getJoinedChallenges(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setSession(null);
    setJoinedChallenges([]); // **Clear Joined Challenges on Sign Out**
    router.push("/(app)/sign-in");
  };

  const getLike = async (userId: string) => {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("Error at getLike:", error);
      return;
    }
    setLikes(data);
  };

  const getFollowers = async (userId: string) => {
    const { data, error } = await supabase
      .from("follows")
      .select("*, users!follows_follower_id_fkey(*)")
      .eq("following_id", userId);
    if (error) {
      console.error("Error at getFollowers:", error);
      return;
    }
    setFollowers(data);
  };

  const getFollowing = async (userId: string) => {
    const { data, error } = await supabase
      .from("follows")
      .select("*, users!follows_following_id_fkey(*)")
      .eq("follower_id", userId);
    if (error) {
      console.error("Error at getFollowing:", error);
      return;
    }
    setFollowing(data);
  };

  const getFriends = async () => {
    const followingIds = following.map((f) => f.following_id);
    const followerIds = followers.map((f) => f.follower_id);
    const mutualIds = followerIds.filter((id) => followingIds.includes(id));
    setFriends(mutualIds);
  };

  /**
   * NEW FUNCTION: Fetch Joined Challenges for a User
   */
  const getJoinedChallenges = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_challenges") // Adjusted to fetch from 'user_challenges' table
        .select("challenge_id, joined_at")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      setJoinedChallenges(data || []);
    } catch (error: any) {
      console.error("Error fetching joined challenges:", error.message);
      Alert.alert("Error", "Failed to fetch joined challenges.");
    }
  };

  /**
   * NEW FUNCTION: Join a Challenge
   */
  const joinChallenge = async (challengeId: string) => {
    // Check if user is logged in
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to join challenges.",
      );
      return;
    }

    // Check if already joined
    const alreadyJoined = joinedChallenges.some(
      (jc) => jc.challenge_id === challengeId,
    );

    if (alreadyJoined) {
      Alert.alert("Already Joined", "You have already joined this challenge.");
      return;
    }

    try {
      const { error } = await supabase.from("user_challenges").insert([
        {
          user_id: user.id,
          challenge_id: challengeId,
        },
      ]);

      if (error) {
        throw error;
      }

      // Update local state
      setJoinedChallenges((prev) => [
        ...prev,
        { challenge_id: challengeId, joined_at: new Date().toISOString() },
      ]);

      Alert.alert("Success", "You have successfully joined the challenge!");
    } catch (error: any) {
      console.error("Error joining challenge:", error.message);
      Alert.alert("Error", "Failed to join the challenge.");
    }
  };

  /**
   * NEW METHOD: Prevent user from following themselves.
   */
  const followUser = async (targetUserId: string) => {
    // Check if user is logged in
    if (!user) {
      Alert.alert("Error", "You must be logged in to follow someone.");
      return;
    }

    // Prevent user from following themselves
    if (targetUserId === user.id) {
      Alert.alert("Error", "You cannot follow yourself.");
      return;
    }

    // Check if already following
    const alreadyFollowing = followers.some(
      (f) => f.follower_id === user.id && f.following_id === targetUserId,
    );

    if (alreadyFollowing) {
      Alert.alert("Already Following", "You are already following this user.");
      return;
    }

    try {
      // Insert 'follow' record
      const { data, error } = await supabase.from("follows").insert([
        {
          follower_id: user.id,
          following_id: targetUserId,
        },
      ]);

      if (error) {
        throw error;
      }

      // Optionally, refresh followers/following data
      await getFollowers(targetUserId);
      await getFollowing(user.id);

      Alert.alert("Success", "You are now following this user!");
    } catch (error: any) {
      console.error("Error following user:", error.message);
      Alert.alert("Error", "Failed to follow user.");
    }
  };

  useEffect(() => {
    if (!initialized) return;

    const inProtectedGroup = segments[1] === "(protected)";

    if (session && !inProtectedGroup) {
      router.replace("/(app)/(protected)");
    } else if (!session) {
      router.replace("/(app)/welcome");
    }

    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }, [initialized, session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session ? session.user : null);
      if (session && session.user) {
        getJoinedChallenges(session.user.id); // **Fetch Joined Challenges on Initialization**
      }
      setInitialized(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session ? session.user : null);
        if (session && session.user) {
          getJoinedChallenges(session.user.id); // **Fetch Joined Challenges on Auth Change**
        } else {
          setJoinedChallenges([]); // **Clear on Sign Out**
        }
      },
    );

    return () => {
      // For Supabase v2, unsubscribe correctly
      authListener.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      getFriends();
    }
  }, [following, followers, user]);

  /**
   * NEW FUNCTION: Fetch Users based on search term
   */
  const getUsers = async (searchTerm: string): Promise<UserDetails[]> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          id,
          username,
          first_name,
          last_name,
          profile_picture_url,
          bio,
          location,
          created_at,
          updated_at
        `,
        )
        .or(
          `username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`,
        )
        .limit(20) // Adjust as needed
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error.message);
        return [];
      }

      console.log("Fetched Users:", data); // Debug Log

      return data as UserDetails[];
    } catch (error: any) {
      console.error("Error in getUsers:", error.message);
      return [];
    }
  };

  /**
   * NEW FUNCTION: Fetch Challenges based on search term
   */
  const getChallenges = async (
    searchTerm: string,
  ): Promise<ChallengeDetails[]> => {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select(
          `
          id,
          title,
          description,
          category,
          is_seasonal,
          is_sponsored,
          video_url,
          duet_video_url,
          created_at,
          updated_at
        `,
        )
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(20) // Adjust as needed
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching challenges:", error.message);
        return [];
      }

      console.log("Fetched Challenges:", data); // Debug Log

      return data as ChallengeDetails[];
    } catch (error: any) {
      console.error("Error in getChallenges:", error.message);
      return [];
    }
  };

  /**
   * NEW FUNCTION: Fetch Submissions based on search term
   */
  const getSubmissions = useCallback(
    async (
      searchTerm: string,
      page: number = 1,
      limit: number = 20
    ): Promise<Submission[]> => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      try {
        const { data, error } = await supabase
          .from("submissions")
          .select(`
            id,
            video_url,
            title,
            description,
            created_at,
            user_id,
            challenge_id,
            creator:users!user_id(
              id,
              username,
              first_name,
              last_name,
              profile_picture_url
            ),
            challenge:challenges!challenge_id(
              id,
              title
            )
          `)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching submissions:", error.message, error.details);
          return [];
        }

        console.log("Fetched Submissions:", data); // Debug Log

        return data as Submission[];
      } catch (error: any) {
        console.error("Error in getSubmissions:", error.message);
        return [];
      }
    },
    []
  );

  return (
    <SupabaseContext.Provider
      value={{
        auth: supabase.auth, // Properly typed auth property
        user,
        session,
        initialized,
        signUp,
        signInWithPassword,
        signOut,
        likes,
        followers,
        following,
        friends,
        joinedChallenges, // **Provide Joined Challenges**
        getLike,
        getFollowers,
        getFollowing,
        getFriends,
        getJoinedChallenges, // **Provide Function**
        joinChallenge, // **Provide Function**
        followUser,
        getUsers,
        getChallenges,
        getSubmissions,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
