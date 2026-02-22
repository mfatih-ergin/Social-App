// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../api/axios";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       api
//         .get("/auth/me")
//         .then((res) => {
//           setUser(res.data);
//         })
//         .catch(() => {
//           localStorage.removeItem("token");
//         })
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = async (email, password) => {
//     const res = await api.post("/auth/login", { email, password });
//     const userData = res.data.user;

//     localStorage.setItem("token", res.data.token);

//     if (userData.settings?.theme) {
//       localStorage.setItem("theme", userData.settings.theme);
//     }

//     setUser(userData);
//     window.dispatchEvent(new Event("storage"));
//   };

//   const register = async (username, email, password) => {
//     const res = await api.post("/auth/register", {
//       username,
//       email,
//       password,
//     });
//     localStorage.setItem("token", res.data.token);
//     setUser(res.data.user);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");

//     localStorage.setItem("theme", "light");
//     setUser(null);

//     window.dispatchEvent(new Event("storage"));
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, login, register, logout, loading, setUser }}
//     >
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

/* ================ KODUN ÇALIŞMA MANTIĞI (ÖZET) ================

1. createContext(): 
   - Uygulamanın "Global Hafızasını" (kasasını) oluşturur. 
   - Kullanıcı verisi, login/logout fonksiyonları bu kasanın içinde duracak ve uygulamanın her yerinden erişilebilecek.

2. AuthProvider ({ children }): 
   - Buradaki "children", main.jsx'te sarmaladığımız <App /> bileşenidir.
   - Bu bileşen, tüm uygulamanın "Güvenlik Görevlisi" gibi davranır.

3. useEffect (Dedektif): 
   - Sayfa her yenilendiğinde (F5) veya uygulama ilk açıldığında bir kere çalışır.
   - Tarayıcının cebine (localStorage) bakar: "Token var mı? Varsa bu token hala geçerli mi?"
   - Eğer geçerliyse kullanıcıyı otomatik olarak giriş yapmış sayar (setUser).

4. login & register: 
   - Backend'e gidip doğrulamayı yapar.
   - Gelen "token"ı localStorage'a kaydeder (Böylece tarayıcı kapansa bile oturum kalır).
   - "setUser" ile React'e "Tamam, içeri aldık" bilgisini verir.

5. !loading && children: 
   - Burası çok kritik bir güvenlik önlemidir.
   - "Dedektif (useEffect) işini bitirmeden sayfayı gösterme" demektir.
   - Bu sayede kullanıcı giriş yapmış olsa bile, saliselik olarak Login ekranını görüp sonra Ana Sayfaya atlaması (flicker) engellenir.

6. useAuth Hook'u: 
   - Diğer dosyalarda (örn: Navbar.js) uzun uzun "useContext(AuthContext)" yazmak yerine,
   - Sadece "const { user } = useAuth()" yazarak verilere ulaşmanı sağlayan pratik bir kısayoldur.
==============================================================
*/

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (error) {
          console.error("Doğrulama hatası:", error);
          localStorage.removeItem("token");
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const userData = res.data.user;
      const token = res.data.token;

      localStorage.setItem("token", token);

      if (userData.settings?.theme) {
        localStorage.setItem("theme", userData.settings.theme);
      }

      setUser(userData);
      setLoading(false);
      window.dispatchEvent(new Event("storage"));

      return res.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setLoading(false);

      return res.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("theme", "light");
    setUser(null);
    setLoading(false);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, setUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth, AuthProvider içerisinde kullanılmalıdır!");
  }
  return context;
};
