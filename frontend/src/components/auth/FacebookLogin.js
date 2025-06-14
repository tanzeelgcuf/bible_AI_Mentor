// frontend/src/components/auth/FacebookLogin.js
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const FacebookLogin = ({
  onSuccess,
  onError,
  buttonText = "Continuar con Facebook",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    // Check if Facebook SDK is already loaded
    if (window.FB) {
      setSdkLoaded(true);
      return;
    }

    // Load Facebook SDK
    const loadFacebookSDK = () => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId:
            process.env.REACT_APP_FACEBOOK_APP_ID || "your-facebook-app-id",
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });
        setSdkLoaded(true);
      };

      // Load the SDK asynchronously
      if (!document.getElementById("facebook-jssdk")) {
        const js = document.createElement("script");
        js.id = "facebook-jssdk";
        js.src = "https://connect.facebook.net/es_ES/sdk.js";
        document.getElementsByTagName("head")[0].appendChild(js);
      }
    };

    loadFacebookSDK();
  }, []);

  const handleFacebookLogin = () => {
    if (!sdkLoaded || !window.FB) {
      toast.error(
        "Facebook SDK no está disponible. Intenta de nuevo en unos segundos."
      );
      return;
    }

    setIsLoading(true);

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          // Get user info
          window.FB.api("/me", { fields: "name,email" }, (userInfo) => {
            const userData = {
              id: response.authResponse.userID,
              accessToken: response.authResponse.accessToken,
              name: userInfo.name,
              email: userInfo.email,
            };

            if (onSuccess) {
              onSuccess(userData);
            }
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
          if (onError) {
            onError("Login cancelado por el usuario");
          }
        }
      },
      {
        scope: "email,public_profile",
        return_scopes: true,
      }
    );
  };

  return (
    <button
      type="button"
      onClick={handleFacebookLogin}
      disabled={isLoading || !sdkLoaded}
      className={`w-full flex justify-center items-center py-3 px-4 border border-gray-300/30 rounded-lg font-medium transition-colors ${
        isLoading || !sdkLoaded
          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}
      {isLoading
        ? "Conectando..."
        : sdkLoaded
          ? buttonText
          : "Cargando Facebook..."}
    </button>
  );
};

export default FacebookLogin;
