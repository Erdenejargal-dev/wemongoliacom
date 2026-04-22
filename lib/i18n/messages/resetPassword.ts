/**
 * /auth/reset-password — new password from email link.
 */

export type ResetPasswordMessages = {
  backToSignIn: string
  title: string
  lead: string
  successMessage: string
  signInCta: string
  newPasswordLabel: string
  confirmPasswordLabel: string
  submit: string
  saving: string
  errTooShort: string
  errMismatch: string
  errInvalidToken: string
  errGeneric: string
  missingTokenLead: string
  missingTokenRequestLink: string
  missingTokenAfterLink: string
  suspenseLoading: string
}

export const resetPasswordEn: ResetPasswordMessages = {
  backToSignIn: 'Back to sign in',
  title: 'Set a new password',
  lead: 'Choose a strong password you have not used here before.',
  successMessage: 'Your password has been updated. You can sign in with your new password.',
  signInCta: 'Sign in',
  newPasswordLabel: 'New password',
  confirmPasswordLabel: 'Confirm password',
  submit: 'Update password',
  saving: 'Saving…',
  errTooShort: 'Password must be at least 8 characters.',
  errMismatch: 'Passwords do not match.',
  errInvalidToken: 'This reset link is invalid. Please request a new one.',
  errGeneric: 'Could not reset password. The link may have expired.',
  missingTokenLead: 'Missing reset token. Open the link from your email or',
  missingTokenRequestLink: 'request a new reset',
  missingTokenAfterLink: '.',
  suspenseLoading: 'Loading…',
}

export const resetPasswordMn: ResetPasswordMessages = {
  backToSignIn: 'Нэвтрэх руу буцах',
  title: 'Шинэ нууц үг',
  lead: 'Өмнө нь энд ашиглаагүй, хангалттай хүчтэй нууц үг сонгоно уу.',
  successMessage: 'Нууц үг шинэчлэгдлээ. Шинэ нууц үгээр нэвтрэнэ үү.',
  signInCta: 'Нэвтрэх',
  newPasswordLabel: 'Шинэ нууц үг',
  confirmPasswordLabel: 'Нууц үг баталгаажуулах',
  submit: 'Шинэчлэх',
  saving: 'Хадгалж байна…',
  errTooShort: 'Нууц үг хамгийн багадаа 8 тэмдэгт байна.',
  errMismatch: 'Нууц үг таарахгүй байна.',
  errInvalidToken: 'Холбоос хүчингүй байна. Дахин сэргээх хүсэлт илгээнэ үү.',
  errGeneric: 'Нууц үг сэргээх боломжгүй. Хугацаа дууссан байж магадгүй.',
  missingTokenLead: 'Токен олдсонгүй. Имэйлээр ирсэн холбоосоор нээнэ үү, эсвэл',
  missingTokenRequestLink: 'дахин сэргээх хүсэлт',
  missingTokenAfterLink: ' илгээнэ үү.',
  suspenseLoading: 'Ачаалж байна…',
}
