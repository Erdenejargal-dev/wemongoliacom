# Authentication System Documentation

## 🔐 Overview
This application uses **NextAuth.js v5** with **credentials-based authentication** and **MongoDB** for secure user management.

---

## 📊 Architecture Flow

### 1. **User Registration Flow**

```
User Fills Form → API Route → Password Hashing → MongoDB Storage
```

**File: `app/api/auth/register/route.ts`**
```typescript
1. User submits: { name, email, password }
2. Server validates input
3. Password is hashed using bcryptjs (10 rounds)
4. User data saved to MongoDB
5. Plain password is NEVER stored
```

**Security Features:**
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Email uniqueness validation
- ✅ Input sanitization
- ✅ Minimum 6 character password requirement

---

### 2. **User Login Flow**

```
Login Form → NextAuth → Credentials Provider → Password Verification → JWT Token → Session
```

**Step-by-Step Process:**

#### **Step 1: User Submits Credentials**
**File: `components/login-form.tsx`**
```typescript
const result = await signIn("credentials", {
  email,
  password,
  redirect: false,
});
```

#### **Step 2: NextAuth Processes Request**
**File: `lib/auth.ts`**
```typescript
CredentialsProvider({
  async authorize(credentials) {
    // 1. Connect to MongoDB
    await connectDB();
    
    // 2. Find user by email
    const user = await User.findOne({ email: credentials.email });
    
    // 3. Verify password using bcrypt
    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      String(user.password)
    );
    
    // 4. Return user data (without password)
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
})
```

#### **Step 3: JWT Token Creation**
NextAuth creates a JWT (JSON Web Token) containing:
```typescript
{
  id: "user_id",
  email: "user@example.com",
  name: "User Name",
  role: "customer" | "business_owner" | "admin"
}
```

#### **Step 4: Session Storage**
- Token stored in **HTTP-only cookie** (client can't access via JavaScript)
- Token expires after 30 days
- Automatically refreshed on each request

---

## 💾 Data Storage

### **MongoDB Collections**

#### **Users Collection**
**File: `lib/models/User.ts`**

```typescript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$hashed_password_here...", // Bcrypt hash
  phone: "+976 12345678",
  role: "customer", // or "business_owner", "admin"
  emailVerified: false,
  isActive: true,
  savedListings: [],
  preferences: {
    language: "en",
    currency: "USD",
    notifications: true
  },
  createdAt: ISODate("2026-01-29..."),
  updatedAt: ISODate("2026-01-29...")
}
```

**Indexes:**
- `email`: Unique index for fast lookups
- `role`: Index for role-based queries

---

## 🔒 Security Measures

### 1. **Password Security**
```typescript
// Registration: Hash password before storing
const hashedPassword = await bcrypt.hash(password, 10);

// Login: Compare hashed passwords
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Why Bcrypt?**
- ✅ Industry-standard hashing algorithm
- ✅ Automatically salted (10 rounds)
- ✅ Computationally expensive (protects against brute force)
- ✅ One-way function (cannot be reversed)

### 2. **Session Management**
**File: `lib/auth.ts`**

```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
},
```

**Security Features:**
- ✅ HTTP-only cookies (XSS protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite attribute (CSRF protection)
- ✅ Automatic token rotation

### 3. **Environment Variables**
**File: `.env.local`**
```env
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb://...
```

**NEXTAUTH_SECRET:**
- Used to encrypt JWT tokens
- Must be random and secure
- Never commit to version control

### 4. **Protected Routes**
**File: `middleware.ts`**
```typescript
// Protects dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### 5. **API Route Protection**
**Example: `app/api/business/route.ts`**
```typescript
const session = await auth();

if (!session || !session.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 🌐 Session Access

### **Client Components**
```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
// session.user.id
// session.user.email
// session.user.name
// session.user.role
```

### **Server Components**
```typescript
import { auth } from "@/lib/auth";

const session = await auth();
```

### **API Routes**
```typescript
import { auth } from "@/lib/auth";

const session = await auth();
```

---

## 🔄 Authentication Flow Diagram

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Login Form     │ → User enters email & password
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│  NextAuth API    │ → POST /api/auth/signin
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Credentials Provider │ → lib/auth.ts
└──────┬───────────────┘
       │
       ▼
┌──────────────────┐
│  MongoDB Lookup  │ → Find user by email
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Password Check   │ → bcrypt.compare()
└──────┬───────────┘
       │
       ├─── ✅ Valid ──────────────┐
       │                           │
       └─── ❌ Invalid → Error     │
                                   ▼
                          ┌──────────────────┐
                          │  Create JWT      │
                          └──────┬───────────┘
                                 │
                                 ▼
                          ┌──────────────────┐
                          │  Set HTTP Cookie │
                          └──────┬───────────┘
                                 │
                                 ▼
                          ┌──────────────────┐
                          │  Redirect User   │
                          │  to Dashboard    │
                          └──────────────────┘
```

---

## 🛡️ Security Best Practices Implemented

1. **✅ Password Hashing** - Bcrypt with 10 salt rounds
2. **✅ JWT Tokens** - Encrypted session data
3. **✅ HTTP-Only Cookies** - Protected from XSS
4. **✅ Secure Environment Variables** - Secrets never exposed
5. **✅ Input Validation** - Email format, password length
6. **✅ Protected API Routes** - Session verification
7. **✅ Role-Based Access Control** - User roles (customer/business_owner/admin)
8. **✅ Database Indexes** - Fast, secure lookups
9. **✅ Error Handling** - Generic error messages (no info leakage)
10. **✅ Session Expiration** - 30-day automatic logout

---

## 🔧 Configuration Files

### **NextAuth Config**
**File: `lib/auth.ts`**
- Credentials provider setup
- JWT callbacks
- Session callbacks
- Page redirects

### **MongoDB Connection**
**File: `lib/mongodb.ts`**
- Connection pooling
- Reconnection logic
- Environment-based configuration

### **User Model**
**File: `lib/models/User.ts`**
- Schema definition
- Validation rules
- Indexes

---

## 🚀 Testing Authentication

### **Test User Creation**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### **Test Login**
- Navigate to `/auth/login`
- Enter credentials
- Check for redirect to `/dashboard`
- Verify session in browser DevTools

---

## 📝 Environment Setup

1. Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

2. Generate secure secret:
```bash
openssl rand -base64 32
```

---

## 🔍 Debugging

### **Check Session**
```typescript
console.log(await auth());
```

### **Verify MongoDB Connection**
```typescript
import connectDB from '@/lib/mongodb';
await connectDB();
```

### **Check User in Database**
```typescript
const user = await User.findOne({ email: "test@example.com" });
console.log(user);
```

---

## 📚 References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Security](https://www.mongodb.com/docs/manual/security/)
- [Bcrypt Algorithm](https://en.wikipedia.org/wiki/Bcrypt)
- [JWT Best Practices](https://jwt.io/introduction)

---

## ⚠️ Important Notes

1. **Never store plain text passwords**
2. **Keep NEXTAUTH_SECRET private**
3. **Use HTTPS in production**
4. **Regularly update dependencies**
5. **Monitor for security vulnerabilities**
6. **Implement rate limiting for login attempts**
7. **Add email verification for production**
8. **Enable two-factor authentication (future enhancement)**
