export const VALIDATION_RULES = {
  username: {
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message:
      "Kullanıcı adı 3-20 karakter olmalı ve sadece harf, rakam, alt çizgi içermelidir.",
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    message:
      "Şifre en az 8 karakter olmalı; bir büyük harf, bir küçük harf ve bir rakam içermelidir.",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Lütfen geçerli bir email adresi giriniz.",
  },
};

export const validateForm = (username, email, password, isLogin = false) => {
  if (!isLogin) {
    if (!VALIDATION_RULES.username.pattern.test(username)) {
      return VALIDATION_RULES.username.message;
    }
  }

  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return VALIDATION_RULES.email.message;
  }

  if (!isLogin && !VALIDATION_RULES.password.pattern.test(password)) {
    return VALIDATION_RULES.password.message;
  }

  return null;
};
