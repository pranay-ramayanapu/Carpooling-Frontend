const BASE = import.meta.env.VITE_API_BASE_URL || "https://carpooling-5as1.onrender.com";
export const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "258600895055-7f97ur8se2o9ra7qa2t9mbb3gbolteub.apps.googleusercontent.com";
export const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    `${BASE}/auth/google/callback`
)}&response_type=code&scope=openid%20email%20profile`;


// authentication
export const LOGIN_URL = `${BASE}/auth/login`;
export const SIGNUP_URL = `${BASE}/auth/sign-up`;
export const GOOGLE_URL = `${BASE}/auth/google/callback`;
export const VERIFY_EMAIL = `${BASE}/auth/verify/email`;
export const VERIFY_OTP = `${BASE}/auth/verify/otp`;
export const VERIFY_TOKEN = `${BASE}/auth/validate`;

// analytics
export const ANALYTICS_URL = `${BASE}/analytics`;

// user management
export const GET_PROFILE = `${BASE}/users/me`;
export const EDIT_URL = `${BASE}/users/me`;
export const UPLOAD_PIC = `${BASE}/users/upload-picture`;
export const GET_USER_LIST = `${BASE}/users/user-list`;
export const PROMOTE_USER = `${BASE}/users/user`;


// banned users management
export const GET_BANNED_USERS_URL = `${BASE}/ban/all`;
export const GET_BANNED_USER = `${BASE}/ban/user`;
export const POST_BANNED_USER = `${BASE}/ban/user`;
export const DELETE_BANNED_USER = `${BASE}/ban/user`;

// ride management
export const RIDES_URL = `${BASE}/rides`;
export const DRIVER_RIDES_URL = `${RIDES_URL}/me`;
export const GET_RIDE_URL = `${RIDES_URL}/ride`;
export const SEACRH_RIDE_URL = `${RIDES_URL}/search`;
export const CREATE_RIDE_URL = `${RIDES_URL}`;
export const CLOSE_RIDE_URL = `${RIDES_URL}/close-ride`;
export const UPDATE_RIDE_URL = `${RIDES_URL}`;
export const DELETE_RIDE_URL = `${RIDES_URL}/delete`;

// Booking management
export const BOOKING_URL = `${BASE}/bookings`;
export const GET_BOOKING = `${BOOKING_URL}/booking`;
export const GET_RIDE_BOOKING = `${BOOKING_URL}/booking/by-ride`;
export const GET_USER_BOOKING = `${BOOKING_URL}/me`;
export const GET_DRIVER_BOOKING = `${BOOKING_URL}/incoming`;
export const DELETE_BOOKING = `${BOOKING_URL}/delete`;

// chatbot management
export const CHATBOT_POST = `${BASE}/public/chat-bot`;

// Failed email management
export const GET_EMAILS = `${BASE}/failed-emails`;
export const DELETE_EMAILS = `${BASE}/failed-emails`;


// review management
export const SUBMIT_REVIEW = `${BASE}/reviews/submit`;
export const CHECK_REVIEW = `${BASE}/reviews/check`;


// sos management
export const SEND_SOS = `${BASE}/sos/alert`;
export const GET_SOS = `${BASE}/sos/alerts`;
export const CLOSE_SOS = `${BASE}/sos/close`;
export const ADD_AUTHORITY = `${BASE}/sos/authority`;
export const GET_AUTHORITY = `${BASE}/sos/authority`;
export const EDIT_AUTHORITY = `${BASE}/sos/authority`;
export const SHARE_LOCATION = `${BASE}/share-location`;
