/**
 * /auth/forgot-password — all user-visible copy.
 */

export type ForgotPasswordMessages = {
  backToSignIn: string
  title: string
  lead: string
  successMessage: string
  emailLabel: string
  emailPlaceholder: string
  submit: string
  sending: string
  genericError: string
}

export const forgotPasswordEn: ForgotPasswordMessages = {
  backToSignIn: 'Back to sign in',
  title: 'Forgot password',
  lead: 'Enter your email and we will send you a link to reset your password if an account exists.',
  successMessage:
    'If an account exists for that email, we sent instructions to reset your password. Check your inbox and spam folder.',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  submit: 'Send reset link',
  sending: 'Sending…',
  genericError: 'Something went wrong. Please try again.',
}

export const forgotPasswordMn: ForgotPasswordMessages = {
  backToSignIn: 'Нэвтрэх руу буцах',
  title: 'Нууц үг сэргээх',
  lead: 'Имэйлээ оруулбал бүртгэл байвал нууц үг сэргээх холбоос илгээнэ.',
  successMessage:
    'Тийм имэйлтэй бүртгэл байвал сэргээх заавар илгээгдлээ. Имэйл, спам хавтсыг шалгана уу.',
  emailLabel: 'Имэйл',
  emailPlaceholder: 'you@example.com',
  submit: 'Холбоос илгээх',
  sending: 'Илгээгдэж байна…',
  genericError: 'Алдаа гарлаа. Дахин оролдоно уу.',
}
